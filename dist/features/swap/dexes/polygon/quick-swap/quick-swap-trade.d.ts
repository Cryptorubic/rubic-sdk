import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
export declare class QuickSwapTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
