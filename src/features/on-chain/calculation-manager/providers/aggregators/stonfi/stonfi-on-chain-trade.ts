import { parseError } from 'src/common/utils/errors';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { StonfiApiService } from './services/stonfi-api-service';

export class StonfiOnChainTrade extends TonOnChainTrade<TonEncodedConfig> {
    public type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.STONFI;

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
        await this.checkWalletState(options?.testMode);

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (options.onConfirm) {
                options.onConfirm(hash);
            }
            transactionHash = hash;
        };

        const fromAddress = this.walletAddress;
        const receiverAddress = options.receiverAddress || this.walletAddress;

        await this.makePreSwapChecks({
            fromAddress,
            receiverAddress,
            skipAmountCheck: this.skipAmountCheck,
            ...(options?.referrer && { referrer: options?.referrer })
        });

        const tonEncodedConfig = await this.encodeDirect();

        try {
            await this.web3Private.sendTransaction({
                onTransactionHash,
                messages: [tonEncodedConfig]
            });
            return transactionHash!;
        } catch (err) {
            throw parseError(err);
        }
    }

    private async encodeDirect(): Promise<TonEncodedConfig> {
        // const { body, to, value } = await StonfiApiService.getTxParams(
        //     this.bestRoute,
        //     this.walletAddress,
        //     this.slippageTolerance
        // );
        return {
            address: 'to',
            amount: 'value',
            payload: 'body'
        };
    }

    protected async calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
        const { outputAmountWei } = await StonfiApiService.makeQuoteRequest(
            this.from,
            this.to,
            this.slippageTolerance
        );

        return outputAmountWei;
    }
}
