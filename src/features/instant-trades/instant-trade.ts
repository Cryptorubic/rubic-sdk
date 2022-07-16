import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { WalletNotConnectedError } from '@rsdk-common/errors/swap/wallet-not-connected.error';
import { WrongNetworkError } from '@rsdk-common/errors/swap/wrong-network.error';
import { BasicTransactionOptions } from '@rsdk-core/blockchain/models/basic-transaction-options';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { Injector } from '@rsdk-core/sdk/injector';
import { EncodeTransactionOptions } from '@rsdk-features/instant-trades/models/encode-transaction-options';
import { GasFeeInfo } from '@rsdk-features/instant-trades/models/gas-fee-info';
import { SwapTransactionOptions } from '@rsdk-features/instant-trades/models/swap-transaction-options';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from '@rsdk-core/blockchain/web3-public/web3-public';
import { BLOCKCHAIN_NAME, BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import {
    OptionsGasParams,
    TransactionGasParams
} from '@rsdk-features/instant-trades/models/gas-params';
import { Cache, UnnecessaryApproveError } from 'src/common';
import { TradeType } from 'src/features';
import { parseError } from '@rsdk-common/utils/errors';
import { Token } from 'src/core';

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

    protected readonly web3Public: Web3Public;

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

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    /**
     * Price impact, based on tokens' usd prices.
     */
    @Cache
    public get priceImpact(): number | null {
        return this.from.calculatePriceImpactPercent(this.to);
    }

    protected constructor(blockchain: BlockchainName) {
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
        options: BasicTransactionOptions,
        checkNeedApprove = true
    ): Promise<TransactionReceipt> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        const approveAmount =
            this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ? this.from.weiAmount : 'infinity';

        return Injector.web3Private.approveTokens(
            this.from.address,
            this.contractAddress,
            approveAmount,
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: BasicTransactionOptions = {
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
        this.checkBlockchainCorrect();
        await this.web3Public.checkBalance(this.from, this.from.tokenAmount, this.walletAddress);
    }

    protected checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    private checkBlockchainCorrect(): never | void {
        if (Injector.web3Private.blockchainName !== this.from.blockchain) {
            throw new WrongNetworkError();
        }
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
