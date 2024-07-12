import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeStruct } from '../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { TonOnChainTrade } from '../../common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';

export class TonkeeperOnChainTrade extends TonOnChainTrade {
    constructor(tradeStruct: OnChainTradeStruct<TonBlockchainName>, providerAddress: string) {
        super(tradeStruct, providerAddress);
    }
}
