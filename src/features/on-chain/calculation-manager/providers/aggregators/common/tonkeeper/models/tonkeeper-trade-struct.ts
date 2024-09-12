import { OnChainTradeType } from '../../../../common/models/on-chain-trade-type';
import { TonOnChainTradeStruct } from '../../../../common/on-chain-trade/ton-on-chain-trade/models/ton-on-chian-trade-types';
import {
    TonkeeperCommonQuoteInfo,
    TonkeeperDexType,
    TonkeeperQuoteResp
} from './tonkeeper-api-types';

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
