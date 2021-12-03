import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { InsufficientFundsError } from '@common/errors/swap/insufficient-funds-error';
import { WalletNotConnectedError } from '@common/errors/swap/wallet-not-connected.error';
import { WrongNetworkError } from '@common/errors/swap/wrong-network.error';
import { BasicTransactionOptions } from '@core/blockchain/models/basic-transaction-options';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { EncodableSwapTransactionOptions } from '@features/swap/models/encodable-swap-transaction-options';
import { GasInfo } from '@features/swap/models/gas-info';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';

export abstract class InstantTrade {
    public abstract from: PriceTokenAmount;

    public abstract to: PriceTokenAmount;

    public abstract readonly gasInfo: GasInfo;

    public abstract readonly slippageTolerance: number;

    protected abstract contractAddress: string;

    public get toTokenAmountMin(): PriceTokenAmount {
        const weiAmountOutMin = this.to.weiAmount.multipliedBy(
            new BigNumber(1).minus(this.slippageTolerance)
        );
        return new PriceTokenAmount({ ...this.to.asStruct, weiAmount: weiAmountOutMin });
    }

    public async needApprove(): Promise<boolean | undefined> {
        const { web3Private, web3PublicService } = Injector;
        const web3Public = web3PublicService.getWeb3Public(this.from.blockchain);

        if (!web3Private?.address) {
            return undefined;
        }

        if (this.from.isNative) {
            return false;
        }

        const allowance = await web3Public.getAllowance(
            this.from.address,
            this.contractAddress,
            web3Private.address
        );
        return allowance.lt(this.from.weiAmount);
    }

    public async approve(options: BasicTransactionOptions): Promise<TransactionReceipt> {
        const { web3Private } = Injector;

        const needApprove = await this.needApprove();

        if (!needApprove) {
            throw new RubicSdkError(
                'You should check allowance via needApprove before call approve. Currently allowance is enough for swap.'
            );
        }

        return web3Private.approveTokens(
            this.from.address,
            this.contractAddress,
            'infinity',
            options
        );
    }

    public abstract swap(options: SwapTransactionOptions): Promise<TransactionReceipt>;

    public abstract encode(options: EncodableSwapTransactionOptions): TransactionConfig;

    protected async checkSettings(): Promise<void> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();
        await this.checkBalanceEnough();
    }

    private checkWalletConnected(): never | void {
        const { web3Private } = Injector;
        if (!web3Private.address) {
            throw new WalletNotConnectedError();
        }
    }

    private checkBlockchainCorrect(): never | void {
        const { web3Private } = Injector;
        if (web3Private.blockchainName !== this.from.blockchain) {
            throw new WrongNetworkError();
        }
    }

    private async checkBalanceEnough(): Promise<never | void> {
        const { web3Private } = Injector;
        const web3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);

        const balance = await web3Public.getBalance(web3Private.address, this.from.address);
        if (
            !balance.isFinite() ||
            !this.from.weiAmount.isFinite() ||
            balance.lt(this.from.weiAmount)
        ) {
            throw new InsufficientFundsError();
        }
    }
}

export interface Uniswapv2InstantTrade extends InstantTrade {
    path: string[];
    deadline: number;
    exact: 'input' | 'output';
}
