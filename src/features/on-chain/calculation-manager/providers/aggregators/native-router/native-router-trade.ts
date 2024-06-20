import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../common/models/on-chain-trade-type';
import { NativeRouterAbstractTrade } from '../common/native-router-abstract/native-router-abstract-trade';

export class NativeRouterTrade extends NativeRouterAbstractTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.NATIVE_ROUTER;
    }
}
