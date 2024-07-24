import { OnChainTradeType } from '../../../../common/models/on-chain-trade-type';
import { TonOnChainTradeStruct } from '../../../../common/on-chain-trade/ton-on-chain-trade/models/ton-on-chian-trade-types';
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
    extends TonOnChainTradeStruct {
    bestRoute: TonkeeperQuoteResp<T>;
    rawAddresses: TxTokensRawAddresses;
    tradeType: Extract<OnChainTradeType, 'DEDUST' | 'STONFI'>;
    tonkeeperDexType: TonkeeperDexType;
}
export interface TxTokensRawAddresses {
    fromRawAddress: string;
    toRawAddress: string;
}
