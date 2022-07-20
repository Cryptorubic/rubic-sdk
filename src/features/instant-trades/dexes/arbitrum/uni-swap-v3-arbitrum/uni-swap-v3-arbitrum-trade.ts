import {
    UniswapV3AbstractTrade,
    UniswapV3TradeStruct
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export class UniSwapV3ArbitrumTrade extends UniswapV3AbstractTrade {
    constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);
    }
}
