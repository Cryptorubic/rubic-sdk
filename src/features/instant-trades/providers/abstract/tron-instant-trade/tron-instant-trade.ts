import { InstantTrade } from 'src/features/instant-trades/providers/abstract/instant-trade';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/injector/injector';
import { UnnecessaryApproveError } from 'src/common/errors';
import BigNumber from 'bignumber.js';

import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronSwapTransactionOptions } from 'src/features/common/models/tron/tron-swap-transaction-options';
import { TronEncodeTransactionOptions } from 'src/features/common/models/tron/tron-encode-transaction-options';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';

export abstract class TronInstantTrade extends InstantTrade {
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
        checkNeedApprove = true
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
            this.contractAddress,
            'infinity',
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<TronSwapTransactionOptions, 'onConfirm' | 'feeLimit'>
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

    public abstract swap(options?: TronSwapTransactionOptions): Promise<string | never>;

    public abstract encode(options: TronEncodeTransactionOptions): Promise<TronTransactionConfig>;

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: TronTransactionOptions = {}
    ): Promise<TronTransactionConfig> {
        return this.web3Private.encodeApprove(tokenAddress, spenderAddress, value, options);
    }
}
