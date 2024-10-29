import { parseError } from 'src/common/utils/errors';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { StonfiTxParamsProvider } from './models/stonfi-abstract';
import { StonfiApiService } from './services/stonfi-api-service';
import { StonfiSwapService } from './services/stonfi-swap-service';

export class StonfiOnChainTrade extends TonOnChainTrade<TonEncodedConfig> {
    public readonly type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.STONFI;

    private readonly stonfiSwapService: StonfiTxParamsProvider = new StonfiSwapService();

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (options.onConfirm) {
                options.onConfirm(hash);
            }
            transactionHash = hash;
        };

        await this.checkWalletState(options?.testMode);
        await this.makePreSwapChecks({
            fromAddress: this.walletAddress,
            receiverAddress: options.receiverAddress,
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
        const tonConfig = this.stonfiSwapService.getTxParams(
            this.from,
            this.to,
            this.walletAddress,
            this.toTokenAmountMin.stringWeiAmount
        );

        return tonConfig;
    }

    protected async calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
        const { amountOutWei } = await StonfiApiService.makeQuoteRequest(
            this.from,
            this.to,
            this.slippageTolerance
        );

        return amountOutWei;
    }
}
