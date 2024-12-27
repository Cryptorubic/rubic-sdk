import BigNumber from 'bignumber.js';
import { UnnecessaryApproveError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';

export abstract class TronOnChainTrade extends OnChainTrade {
    public abstract readonly from: PriceTokenAmount<TronBlockchainName>;

    public abstract readonly to: PriceTokenAmount<TronBlockchainName>;

    protected get web3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected get web3Private(): TronWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public async approve(
        options: TronTransactionOptions,
        checkNeedApprove = true,
        amount: BigNumber | 'infinity' = 'infinity'
    ): Promise<string> {
        if (checkNeedApprove) {
            const needApprove = await this.needApprove();
            if (!needApprove) {
                throw new UnnecessaryApproveError();
            }
        }

        this.checkWalletConnected();
        await this.checkBlockchainCorrect();

        return this.web3Private.approveTokens(
            this.from.address,
            this.spenderAddress,
            amount,
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm' | 'feeLimit'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const approveOptions: TronTransactionOptions = {
            onTransactionHash: options?.onApprove,
            feeLimit: options?.approveFeeLimit
        };
        await this.approve(approveOptions, false);
    }

    public abstract swap(options?: SwapTransactionOptions): Promise<string | never>;

    public abstract encode(options: EncodeTransactionOptions): Promise<TronTransactionConfig>;

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: TronTransactionOptions = {}
    ): Promise<TronTransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }
}
