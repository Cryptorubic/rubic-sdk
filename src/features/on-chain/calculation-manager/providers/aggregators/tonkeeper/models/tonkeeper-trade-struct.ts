import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeStruct } from '../../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { TonkeeperQuoteResp } from './tonkeeper-api-types';

export interface TonkeeperOnChainTradeStruct extends OnChainTradeStruct<TonBlockchainName> {
    bestRoute: TonkeeperQuoteResp;
}
