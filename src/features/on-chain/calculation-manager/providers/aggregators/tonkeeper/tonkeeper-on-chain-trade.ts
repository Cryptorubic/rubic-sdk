import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { TonkeeperQuoteResp } from './models/tonkeeper-api-types';
import { TonkeeperOnChainTradeStruct } from './models/tonkeeper-trade-struct';
import { TonkeeperApiService } from './services/tonkeeper-api-service';

export class TonkeeperOnChainTrade extends TonOnChainTrade {
    public type = ON_CHAIN_TRADE_TYPE.TONKEEPER;

    private readonly bestRoute: TonkeeperQuoteResp;

    constructor(tradeStruct: TonkeeperOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.bestRoute = tradeStruct.bestRoute;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<TonEncodedConfig> {
        const { body, to, value } = await TonkeeperApiService.encodeParamsForSwap(
            this.bestRoute,
            options.receiverAddress || this.walletAddress,
            this.slippageTolerance
        );

        return {
            address: to,
            amount: value,
            payload: body
        };
    }
}
