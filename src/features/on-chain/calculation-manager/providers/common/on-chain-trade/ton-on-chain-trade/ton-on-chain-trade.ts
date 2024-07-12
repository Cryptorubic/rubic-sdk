import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeStruct } from '../evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { OnChainTrade } from '../on-chain-trade';

export abstract class TonOnChainTrade extends OnChainTrade {
    constructor(_tradeStruct: OnChainTradeStruct<TonBlockchainName>, providerAddress: string) {
        super(providerAddress);
    }
}
