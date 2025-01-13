import BigNumber from 'bignumber.js';
import {
    RubicSdkError,
    WalletNotConnectedError,
    WrongFromAddressError,
    WrongReceiverAddressError
} from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { isAddressCorrect } from 'src/features/common/utils/check-address';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';

/**
 * Abstract class for all cross-chain providers' trades.
 */
export abstract class CrossChainTrade<T = unknown> {
    protected lastTransactionConfig: T | null = null;

    /**
     * Type of calculated cross-chain trade.
     */
    public abstract readonly type: CrossChainTradeType;

    /**
     * Token to sell with input amount.
     */
    public abstract readonly from: PriceTokenAmount;

    /**
     * Token to get with output amount.
     */
    public abstract readonly to: PriceTokenAmount;

    /**
     * Minimum amount of output token user will get in Eth units.
     */
    public abstract readonly toTokenAmountMin: BigNumber;

    /**
     * Swap fee information.
     */
    public abstract readonly feeInfo: FeeInfo;

    /**
     * Contains on-chain providers' type used in route.
     */
    public abstract readonly onChainSubtype: OnChainSubtype;

    /**
     * Contains bridge provider's type used in route.
     */
    public abstract readonly bridgeType: BridgeType;

    /**
     * True, if provider is aggregator.
     */
    public abstract readonly isAggregator: boolean;

    /**
     * Promotions array.
     */
    public promotions: string[] = [];

    protected abstract get fromContractAddress(): string;

    protected get httpClient(): HttpClient {
        return Injector.httpClient;
    }

    protected get fromWeb3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): Web3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    protected get walletAddress(): string {
        return this._apiFromAddress ?? this.web3Private.address;
    }

    protected abstract get methodName(): string;

    public get networkFee(): BigNumber {
        return new BigNumber(this.feeInfo.rubicProxy?.fixedFee?.amount || 0).plus(
            this.feeInfo.provider?.cryptoFee?.amount || 0
        );
    }

    public get platformFee(): BigNumber {
        return new BigNumber(this.feeInfo.rubicProxy?.platformFee?.percent || 0).plus(
            this.feeInfo.provider?.platformFee?.percent || 0
        );
    }

    protected isProxyTrade: boolean;

    protected get amountToCheck(): string {
        return this.to.stringWeiAmount;
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

    private _apiFromAddress: string | null = null;

    public set apiFromAddress(value: string | null) {
        this._apiFromAddress = value;
    }

    protected constructor(
        protected readonly providerAddress: string,
        protected readonly routePath: RubicStep[],
        protected readonly useProxy: boolean
    ) {
        this.isProxyTrade = useProxy;
    }

    /**
     * Returns true, if allowance is not enough.
     */
    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative && this.from.blockchain !== BLOCKCHAIN_NAME.METIS) {
            return false;
        }

        const fromTokenAddress =
            this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
                ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
                : this.from.address;

        const allowance = await this.fromWeb3Public.getAllowance(
            fromTokenAddress,
            this.walletAddress,
            this.fromContractAddress
        );
        return this.from.weiAmount.gt(allowance);
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
     * Sends swap transaction with connected wallet.
     * If user has not enough allowance, then approve transaction will be called first.
     *
     * @example
     * ```ts
     * const onConfirm = (hash: string) => console.log(hash);
     * const receipt = await trade.swap({ onConfirm });
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

    /**
     * Build encoded approve transaction config.
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

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        await Promise.all([
            this.checkBlockchainCorrect(),
            this.checkUserBalance(),
            this.checkBlockchainRequirements()
        ]);
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    public async checkBlockchainRequirements(): Promise<boolean> {
        if (this.to.blockchain === BLOCKCHAIN_NAME.SEI && !this.to.isNative && this.walletAddress) {
            const web3 = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SEI);
            const transactionCount = await web3.getTransactionCount(this.walletAddress);
            const balance = await web3.getBalance(this.walletAddress, this.to.address);
            if (new BigNumber(balance).eq(0) && transactionCount === 0) {
                return true;
            }
        }
        return false;
    }

    protected async checkBlockchainCorrect(): Promise<void | never> {
        await this.web3Private.checkBlockchainCorrect(this.from.blockchain);
    }

    protected async checkUserBalance(): Promise<void | never> {
        await this.fromWeb3Public.checkBalance(
            this.from,
            this.from.tokenAmount,
            this.walletAddress
        );
    }

    protected async checkFromAddress(
        fromAddress: string | undefined,
        isRequired = false,
        crossChainType?: CrossChainTradeType
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
            crossChainType
        );
        if (!isAddressCorrectValue) {
            throw new WrongFromAddressError();
        }
    }

    protected async checkReceiverAddress(
        receiverAddress: string | undefined,
        isRequired = false,
        crossChainType?: CrossChainTradeType
    ): Promise<void | never> {
        if (!receiverAddress) {
            if (isRequired) {
                throw new RubicSdkError(`'receiverAddress' is required option`);
            }
            return;
        }
        const isAddressCorrectValue = await isAddressCorrect(
            receiverAddress,
            this.to.blockchain,
            crossChainType
        );
        if (!isAddressCorrectValue) {
            throw new WrongReceiverAddressError();
        }
    }

    /**
     * Calculates value for swap transaction.
     * @param providerValue Value, returned from cross-chain provider. Not '0' if from is native or provider has extranative
     */
    protected getSwapValue(providerValue?: BigNumber | string | number | null): string {
        const nativeToken = nativeTokensList[this.from.blockchain];
        const fixedFeeValue = Web3Pure.toWei(
            this.feeInfo.rubicProxy?.fixedFee?.amount || 0,
            nativeToken.decimals
        );

        let fromValue: BigNumber;
        if (this.from.isNative) {
            if (providerValue) {
                fromValue = new BigNumber(providerValue).dividedBy(
                    1 - (this.feeInfo.rubicProxy?.platformFee?.percent || 0) / 100
                );
            } else {
                fromValue = this.from.weiAmount;
            }
        } else {
            fromValue = new BigNumber(providerValue || 0);
        }
        // 100 / 0.98
        return new BigNumber(fromValue).plus(fixedFeeValue).toFixed(0, 0);
    }

    public abstract getUsdPrice(providerFeeTokenPrice?: BigNumber): BigNumber;

    public abstract getTradeInfo(): TradeInfo;

    protected abstract getTransactionConfigAndAmount(
        receiverAddress?: string,
        refundAddress?: string
    ): Promise<{ config: T; amount: string }>;

    protected async setTransactionConfig(
        skipAmountChangeCheck: boolean,
        useCacheData: boolean,
        receiverAddress?: string,
        refundAddress?: string
    ): Promise<T> {
        if (this.lastTransactionConfig && useCacheData) {
            return this.lastTransactionConfig;
        }

        const { config, amount } = await this.getTransactionConfigAndAmount(
            receiverAddress,
            refundAddress
        );
        this.lastTransactionConfig = config;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!skipAmountChangeCheck) {
            this.checkAmountChange(amount, this.amountToCheck);
        }
        return config;
    }
}
