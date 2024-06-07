import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { NativeRouterAbstractTrade } from '../common/native-router-abstract/native-router-abstract-trade';

export class NativeRouterTrade extends NativeRouterAbstractTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.NATIVE_ROUTER;
}
