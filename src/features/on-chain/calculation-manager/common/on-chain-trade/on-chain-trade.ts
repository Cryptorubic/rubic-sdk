import BigNumber from 'bignumber.js';
import {
    RubicSdkError,
    WalletNotConnectedError,
    WrongFromAddressError,
    WrongReceiverAddressError
} from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount, Token, TokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { isAddressCorrect } from 'src/features/common/utils/check-address';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';

/**
 * Abstract class for all instant trade providers' trades.
 */
export abstract class OnChainTrade {
    /**
     * Token to sell with input amount.
     */
    public abstract readonly from: PriceTokenAmount;

    /**
     * Token to get with output amount.
     */
    public abstract readonly to: PriceTokenAmount;

    public abstract readonly slippageTolerance: number;

    protected abstract readonly spenderAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    public abstract readonly path: ReadonlyArray<Token>;

    public abstract readonly feeInfo: FeeInfo;

    private _apiFromAddress: string | null = null;

    public set apiFromAddress(value: string | null) {
        this._apiFromAddress = value;
    }

    /**
     * Type of instant trade provider.
     */
    public abstract get type(): OnChainTradeType;

    /**
     * Minimum amount of output token user can get.
     */
    public get toTokenAmountMin(): PriceTokenAmount {
        const weiAmountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance);
        return new PriceTokenAmount({ ...this.to.asStruct, weiAmount: weiAmountOutMin });
    }

    protected get web3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): Web3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    protected get walletAddress(): string {
        return this._apiFromAddress ?? this.web3Private.address;
    }

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    /**
     * Price impact, based on tokens' usd prices.
     */
    @Cache
    public get priceImpact(): number | null {
        return this.from.calculatePriceImpactPercent(this.to);
    }

    protected constructor(protected readonly providerAddress: string) {}

    /**
     * Returns true, if allowance is not enough.
     */
    public async needApprove(fromAddress?: string): Promise<boolean> {
        if (!fromAddress) {
            this.checkWalletConnected();
        }

        // Native coin in METIS can be Token required approve
        if (this.from.isNative && this.from.blockchain !== BLOCKCHAIN_NAME.METIS) {
            return false;
        }

        // Special native address for METIS native coin
        const fromTokenAddress =
            this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
                ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
                : this.from.address;

        const allowance = await this.web3Public.getAllowance(
            fromTokenAddress,
            fromAddress || this.walletAddress,
            this.spenderAddress
        );
        return allowance.lt(this.from.weiAmount);
    }

    /**
     * Sends approve transaction with connected wallet.
     * @param options Transaction options.
     * @param checkNeedApprove If true, first allowance is checked.
     * @param amount Amount of tokens in approval window in spending cap field
     */
    public abstract approve(
        options: BasicTransactionOptions,
        checkNeedApprove?: boolean,
        amount?: BigNumber | 'infinity'
    ): Promise<unknown>;

    /**
     * Builds encoded approve transaction config.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address to approve.
     * @param value Token amount to approve in wei.
     * @param [options] Additional options.
     * @returns Encoded approve transaction config.
     */
    public abstract encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: BasicTransactionOptions
    ): Promise<unknown>;

    /**
     * Sends swap transaction with connected wallet.
     * If user has not enough allowance, then approve transaction will be called first.
     *
     * @example
     * ```ts
     * const onConfirm = (hash: string) => console.log(hash);
     * const receipt = await trades[TRADE_TYPE.UNISWAP_V2].swap({ onConfirm });
     * ```
     *
     * @param options Transaction options.
     */
    public abstract swap(options?: SwapTransactionOptions): Promise<string | never>;

    /**
     * Builds transaction config, with encoded data.
     * @param options Encode transaction options.
     */
    public abstract encode(options: EncodeTransactionOptions): Promise<unknown>;

    protected async checkWalletState(testMode: boolean = false): Promise<void> {
        this.checkWalletConnected();
        await this.checkBlockchainCorrect();
        if (!testMode) {
            await this.checkBalance();
        }
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    protected async checkBlockchainCorrect(): Promise<void | never> {
        await this.web3Private.checkBlockchainCorrect(this.from.blockchain);
    }

    protected async checkBalance(): Promise<void | never> {
        await this.web3Public.checkBalance(this.from, this.from.tokenAmount, this.walletAddress);
    }

    protected async checkFromAddress(
        fromAddress: string | undefined,
        isRequired = false,
        chainType?: OnChainTradeType
    ): Promise<void | never> {
        if (!fromAddress) {
            if (isRequired) {
                throw new RubicSdkError(`'fromAddress' is required option`);
            }
            return;
        }

        const isAddressCorrectValue = await isAddressCorrect(
            fromAddress,
            this.from.blockchain,
            chainType
        );

        if (!isAddressCorrectValue) {
            throw new WrongFromAddressError();
        }
    }

    protected async checkReceiverAddress(
        receiverAddress: string | undefined,
        isRequired = false,
        chainType?: OnChainTradeType
    ): Promise<void | never> {
        if (!receiverAddress) {
            if (isRequired) {
                throw new RubicSdkError(`'receiverAddress' is required option`);
            }
            return;
        }

        const isAddressCorrectValue = await isAddressCorrect(
            receiverAddress,
            this.from.blockchain,
            chainType
        );

        if (!isAddressCorrectValue) {
            throw new WrongReceiverAddressError();
        }
    }

    protected getRoutePath(): RubicStep[] {
        return [
            {
                type: 'on-chain',
                provider: this.type,
                path: this.path.map(
                    token => new TokenAmount({ ...token, tokenAmount: new BigNumber(0) })
                )
            }
        ];
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippageTolerance * 100,
            routePath: this.getRoutePath()
        };
    }

    protected checkAmountChange(newWeiAmount: string, oldWeiAmount: string): void {
        const oldAmount = new BigNumber(oldWeiAmount);
        const newAmount = new BigNumber(newWeiAmount);
        const changePercent = 0.5;
        const acceptablePercentPriceChange = new BigNumber(changePercent).dividedBy(100);

        const amountPlusPercent = oldAmount.multipliedBy(acceptablePercentPriceChange.plus(1));
        const amountMinusPercent = oldAmount.multipliedBy(
            new BigNumber(1).minus(acceptablePercentPriceChange)
        );

        const shouldThrowError =
            newAmount.lt(amountMinusPercent) || newAmount.gt(amountPlusPercent);

        if (shouldThrowError) {
            throw new UpdatedRatesError(oldWeiAmount, newWeiAmount);
        }
    }
}
