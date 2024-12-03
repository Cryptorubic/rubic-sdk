import { TonOnChainTradeStruct } from '../../../common/on-chain-trade/ton-on-chain-trade/models/ton-on-chian-trade-types';
import { ToncoCommonParams } from './tonco-facade-types';

export interface ToncoOnChainTradeStruct extends TonOnChainTradeStruct {
    params: ToncoCommonParams;
}
