import { InsufficientFundsError } from '@common/errors/swap/insufficient-funds-error';
import { WalletNotConnectedError } from '@common/errors/swap/wallet-not-connected.error';
import { WrongNetworkError } from '@common/errors/swap/wrong-network.error';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { GasInfo } from '@features/swap/models/gas-info';
import BigNumber from 'bignumber.js';
import { DeepReadonly } from 'src/common/utils/types/deep-readonly';

export abstract class InstantTrade {
    public abstract from: DeepReadonly<PriceTokenAmount>;

    public abstract to: DeepReadonly<PriceTokenAmount>;

    public abstract readonly gasInfo: DeepReadonly<GasInfo>;

    public abstract readonly slippageTolerance: number;

    public get toTokenAmountMin(): PriceTokenAmount {
        const weiAmountOutMin = this.to.weiAmount.multipliedBy(
            new BigNumber(1).minus(this.slippageTolerance)
        );
        return new PriceTokenAmount({ ...this.to.asStruct, weiAmount: weiAmountOutMin });
    }

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
