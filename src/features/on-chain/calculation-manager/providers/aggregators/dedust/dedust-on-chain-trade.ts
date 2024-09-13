import { toNano } from '@ton/core';
import { parseError } from 'src/common/utils/errors';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { DedustOnChainTradeStruct } from './models/dedust-trade-types';
import { DedustSwapService } from './services/dedust-swap-service';

export class DedustOnChainTrade extends TonOnChainTrade {
    public type: OnChainTradeType = ON_CHAIN_TRADE_TYPE.DEDUST;

    private readonly dedustSwapService = new DedustSwapService();

    constructor(tradeStruct: DedustOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
    }

    protected async calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
        const fromAsset = this.dedustSwapService.getTokenAsset(this.from);
        const toAsset = this.dedustSwapService.getTokenAsset(this.to);
        const pool = await this.dedustSwapService.getPool(fromAsset, toAsset);
        const { amountOut } = await pool.getEstimatedSwapOut({
            assetIn: fromAsset,
            amountIn: toNano(this.fromWithoutFee.tokenAmount.toFixed())
        });

        return amountOut.toString();
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkWalletState(options?.testMode);

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (options.onConfirm) {
                options.onConfirm(hash);
            }
            transactionHash = hash;
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
                onTransactionHash
            );
            return transactionHash!;
        } catch (err) {
            throw parseError(err);
        }
    }
}
