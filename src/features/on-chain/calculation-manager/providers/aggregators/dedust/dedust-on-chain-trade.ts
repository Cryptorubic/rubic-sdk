import { parseError } from 'src/common/utils/errors';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { DedustOnChainTradeStruct } from './models/dedust-trade-types';
import { DedustSwapService } from './services/dedust-swap-service';

export class DedustOnChainTrade extends TonOnChainTrade<undefined> {
    public type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.DEDUST;

    private readonly dedustSwapService = new DedustSwapService();

    constructor(tradeStruct: DedustOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState(options?.testMode);

        let txHash: string;
        const onTransactionHash = (hash: string) => {
            if (options.onConfirm) {
                options.onConfirm(hash);
            }
            txHash = hash;
        };

        await this.makePreSwapChecks({
            fromAddress: this.walletAddress,
            receiverAddress: this.walletAddress,
            skipAmountCheck: this.skipAmountCheck,
            ...(options?.referrer && { referrer: options?.referrer })
        });

        try {
            await this.dedustSwapService.sendTransaction(
                this.from,
                this.to,
                this.walletAddress,
                this.slippageTolerance,
                onTransactionHash
            );
            return txHash!;
        } catch (err) {
            throw parseError(err);
        }
    }

    protected calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
        return this.dedustSwapService.calcOutputAmount(this.from, this.to);
    }
}
