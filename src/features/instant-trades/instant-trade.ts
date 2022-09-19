import { PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RubicSdkError, UnnecessaryApproveError, WalletNotConnectedError } from 'src/common/errors';
import { GasFeeInfo } from 'src/features/instant-trades/models/gas-fee-info';
import { EvmBasicTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-basic-transaction-options';
import { TransactionReceipt } from 'web3-eth';
import { parseError } from 'src/common/utils/errors';
import { TransactionConfig } from 'web3-core';
import {
    OptionsGasParams,
    TransactionGasParams
} from 'src/features/instant-trades/models/gas-params';
import { Injector } from 'src/core/injector/injector';
import { EvmTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/models/evm-transaction-options';
import { SwapTransactionOptions } from 'src/features/instant-trades/models/swap-transaction-options';
import { EncodeTransactionOptions } from 'src/features/instant-trades/models/encode-transaction-options';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Cache } from 'src/common/utils/decorators';
import { TradeType } from 'src/features/instant-trades/models/trade-type';
import BigNumber from 'bignumber.js';

/**
 * Abstract class for all instant trade providers' trades.
 */
export abstract class InstantTrade {
    /**
     * Token to sell with input amount.
     */
    public abstract readonly from: PriceTokenAmount;

    /**
     * Token to get with output amount.
     */
    public abstract readonly to: PriceTokenAmount;

    /**
     * Gas fee info, including gas limit and gas price.
     */
    public abstract gasFeeInfo: GasFeeInfo | null;

    /**
     * Slippage tolerance. Can be mutated after calculation, except for Zrx.
     */
    public abstract slippageTolerance: number;

    protected abstract readonly contractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    protected readonly web3Public: EvmWeb3Public;

    /**
     * Type of instant trade provider.
     */
    public abstract get type(): TradeType;

    public abstract readonly path: ReadonlyArray<Token>;

    /**
     * Minimum amount of output token user can get.
     */
    public get toTokenAmountMin(): PriceTokenAmount {
        const weiAmountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance);
        return new PriceTokenAmount({ ...this.to.asStruct, weiAmount: weiAmountOutMin });
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    protected get walletAddress(): string {
        return this.web3Private.address;
    }

    /**
     * Price impact, based on tokens' usd prices.
     */
    @Cache
    public get priceImpact(): number | null {
        return this.from.calculatePriceImpactPercent(this.to);
    }

    protected constructor(blockchain: EvmBlockchainName) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    }

    /**
     * Returns true, if allowance is not enough.
     */
    public async needApprove(fromAddress?: string): Promise<boolean> {
        if (!fromAddress) {
            this.checkWalletConnected();
        }

        if (this.from.isNative) {
            return false;
        }

        const allowance = await this.web3Public.getAllowance(
            this.from.address,
            fromAddress || this.walletAddress,
            this.contractAddress
        );
        return allowance.lt(this.from.weiAmount);
    }

    /**
     * Sends approve transaction with connected wallet.
     * @param options Transaction options.
     * @param checkNeedApprove If true, first allowance is checked.
     */
    public async approve(
        options: EvmBasicTransactionOptions,
        checkNeedApprove = true
    ): Promise<TransactionReceipt> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        const approveAmount =
            this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
            this.from.blockchain === BLOCKCHAIN_NAME.CRONOS
                ? this.from.weiAmount
                : 'infinity';

        return this.web3Private.approveTokens(
            this.from.address,
            this.contractAddress,
            approveAmount,
            options
        );
    }

    /**
     * Build encoded approve transaction config.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address to approve.
     * @param value Token amount to approve in wei.
     * @param [options] Additional options.
     * @returns Encoded approve transaction config.
     */
    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: EvmTransactionOptions = {}
    ): Promise<TransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: EvmBasicTransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.approveGasLimit || undefined,
            gasPrice: options?.gasPrice || undefined
        };

        await this.approve(approveOptions, false);
    }

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
    public abstract swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>;

    /**
     * Builds transaction config, with encoded data.
     * @param options Encode transaction options.
     */
    public abstract encode(options: EncodeTransactionOptions): Promise<TransactionConfig>;

    protected async checkWalletState(): Promise<void> {
        this.checkWalletConnected();
        await this.checkBlockchainCorrect();
        await this.checkBalance();
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    private async checkBlockchainCorrect(): Promise<void | never> {
        await this.web3Private.checkBlockchainCorrect(this.from.blockchain);
    }

    protected async checkBalance(): Promise<void | never> {
        await this.web3Public.checkBalance(this.from, this.from.tokenAmount, this.walletAddress);
    }

    protected getGasParams(options: OptionsGasParams): TransactionGasParams {
        return {
            gas: options.gasLimit || this.gasFeeInfo?.gasLimit?.toFixed(),
            gasPrice: options.gasPrice || this.gasFeeInfo?.gasPrice?.toFixed()
        };
    }

    protected parseError(err: unknown): RubicSdkError {
        return parseError(err, 'Cannot calculate instant trade');
    }
}
