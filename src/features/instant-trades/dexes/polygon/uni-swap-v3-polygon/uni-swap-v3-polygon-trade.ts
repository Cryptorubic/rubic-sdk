import { TRADE_TYPE, TradeType } from 'src/features';
import {
    UniswapV3AbstractTrade,
    UniswapV3TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export class UniSwapV3PolygonTrade extends UniswapV3AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.UNI_SWAP_V3_POLYGON;
    }

    constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);
    }
}
