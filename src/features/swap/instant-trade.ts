import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { WalletNotConnectedError } from '@common/errors/swap/wallet-not-connected.error';
import { WrongNetworkError } from '@common/errors/swap/wrong-network.error';
import { BasicTransactionOptions } from '@core/blockchain/models/basic-transaction-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { EncodeTransactionOptions } from '@features/swap/models/encode-transaction-options';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { OptionsGasParams, TransactionGasParams } from '@features/swap/models/gas-params';

export abstract class InstantTrade {
    public abstract readonly from: PriceTokenAmount;

    public abstract readonly to: PriceTokenAmount;

    public abstract readonly gasFeeInfo: GasFeeInfo | null;

    public abstract readonly slippageTolerance: number;

    protected abstract contractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

    protected readonly web3Private = Injector.web3Private;

    protected readonly web3Public: Web3Public;

    protected get walletAddress(): string {
        return this.web3Private.address;
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        const weiAmountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance);
        return new PriceTokenAmount({ ...this.to.asStruct, weiAmount: weiAmountOutMin });
    }

    protected constructor(blockchain: BLOCKCHAIN_NAME) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    }

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.from.isNative) {
            return false;
        }

        const allowance = await this.web3Public.getAllowance(
            this.from.address,
            this.walletAddress,
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

        return this.web3Private.approveTokens(
            this.from.address,
            this.contractAddress,
            'infinity',
            options
        );
    }

    public abstract swap(options?: SwapTransactionOptions): Promise<TransactionReceipt>;

    public abstract encode(options?: EncodeTransactionOptions): Promise<TransactionConfig>;

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
        if (this.web3Private.blockchainName !== this.from.blockchain) {
            throw new WrongNetworkError();
        }
    }

    protected getGasLimit(options?: { gasLimit?: string | null }): string | undefined {
        if (options?.gasLimit) {
            return options.gasLimit;
        }
        if (this.gasFeeInfo?.gasLimit?.isFinite()) {
            return this.gasFeeInfo.gasLimit.toFixed(0);
        }
        return undefined;
    }

    protected getGasPrice(options?: { gasPrice?: string | null }): string | undefined {
        if (options?.gasPrice) {
            return options.gasPrice;
        }
        if (this.gasFeeInfo?.gasPrice?.isFinite()) {
            return this.gasFeeInfo.gasPrice.toFixed(0);
        }
        return undefined;
    }

    protected getGasParams(options: OptionsGasParams): TransactionGasParams {
        const gas = this.getGasLimit({
            gasLimit: options.gasLimit
        });
        const gasPrice = this.getGasPrice({
            gasPrice: options.gasPrice
        });
        return { gas, gasPrice };
    }
}
