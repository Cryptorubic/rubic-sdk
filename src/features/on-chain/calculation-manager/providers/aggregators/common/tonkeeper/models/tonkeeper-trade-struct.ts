import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeType } from '../../../../common/models/on-chain-trade-type';
import { OnChainTradeStruct } from '../../../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import {
    TonkeeperCommonQuoteInfo,
    TonkeeperDedustQuoteInfo,
    TonkeeperDexType,
    TonkeeperQuoteResp,
    TonkeeperStonfiQuoteInfo
} from './tonkeeper-api-types';

export type DedustOnChainTradeStruct = TonkeeperOnChainTradeStruct<TonkeeperDedustQuoteInfo>;
export type StonfiOnChainTradeStruct = TonkeeperOnChainTradeStruct<TonkeeperStonfiQuoteInfo>;

export interface TonkeeperOnChainTradeStruct<T extends TonkeeperCommonQuoteInfo>
    extends OnChainTradeStruct<TonBlockchainName> {
    bestRoute: TonkeeperQuoteResp<T>;
    rawAddresses: TxTokensRawAddresses;
    tradeType: Extract<OnChainTradeType, 'DEDUST' | 'STONFI'>;
    tonkeeperDexType: TonkeeperDexType;
}
export interface TxTokensRawAddresses {
    fromRawAddress: string;
    toRawAddress: string;
}
