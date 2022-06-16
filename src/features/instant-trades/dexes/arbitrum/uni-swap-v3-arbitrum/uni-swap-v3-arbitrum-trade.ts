import { TRADE_TYPE, TradeType } from 'src/features';
import {
    UniswapV3AbstractTrade,
    UniswapV3TradeStruct
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export class UniSwapV3ArbitrumTrade extends UniswapV3AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.UNI_SWAP_V3_ARBITRUM;
    }

    constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);
    }
}
