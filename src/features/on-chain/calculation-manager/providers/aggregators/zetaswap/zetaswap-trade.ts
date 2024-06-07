import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { NativeRouterAbstractTrade } from '../common/native-router-abstract/native-router-abstract-trade';

export class ZetaswapTrade extends NativeRouterAbstractTrade {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.ZETA_SWAP;
}
