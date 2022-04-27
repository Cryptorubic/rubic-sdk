import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { WalletNotConnectedError } from '@common/errors/swap/wallet-not-connected.error';
import { WrongNetworkError } from '@common/errors/swap/wrong-network.error';
import { BasicTransactionOptions } from '@core/blockchain/models/basic-transaction-options';
import { TransactionOptions } from '@core/blockchain/models/transaction-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { EncodeTransactionOptions } from '@features/instant-trades/models/encode-transaction-options';
import { GasFeeInfo } from '@features/instant-trades/models/gas-fee-info';
import { SwapTransactionOptions } from '@features/instant-trades/models/swap-transaction-options';
import { TradeType } from 'src/features';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { OptionsGasParams, TransactionGasParams } from '@features/instant-trades/models/gas-params';
import { Cache } from 'src/common';

export abstract class InstantTrade {
    public abstract readonly from: PriceTokenAmount;

    public abstract readonly to: PriceTokenAmount;

    public abstract gasFeeInfo: GasFeeInfo | null;

    public abstract slippageTolerance: number;

    protected abstract contractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    protected readonly web3Public: Web3Public;

    public abstract get type(): TradeType;

    public get toTokenAmountMin(): PriceTokenAmount {
        const weiAmountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance);
        return new PriceTokenAmount({ ...this.to.asStruct, weiAmount: weiAmountOutMin });
    }

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    @Cache
    public get priceImpact(): number | null {
        return this.from.calculatePriceImpactPercent(this.to);
    }

    protected constructor(blockchain: BLOCKCHAIN_NAME) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    }

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

    public async approve(options?: BasicTransactionOptions): Promise<TransactionReceipt> {
        const needApprove = await this.needApprove();

        if (!needApprove) {
            throw new RubicSdkError(
                'You should check allowance via `needApprove` method before calling `approve`. Current allowance is enough for swap.'
            );
        }

        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        return Injector.web3Private.approveTokens(
            this.from.address,
            this.contractAddress,
            'infinity',
            { ...options, gas: options?.gasLimit }
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const txOptions: TransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.gasLimit || undefined,
            gasPrice: options?.gasPrice || undefined
        };

        await Injector.web3Private.approveTokens(
            this.from.address,
            this.contractAddress,
            'infinity',
            txOptions
        );
    }

    public abstract swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>;

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
        return { gas: options?.gasLimit, gasPrice: options?.gasPrice };
    }
}
