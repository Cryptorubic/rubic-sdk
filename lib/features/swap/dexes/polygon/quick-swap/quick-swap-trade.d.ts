import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TradeType } from '../../../..';
export declare class QuickSwapTrade extends UniswapV2AbstractTrade {
    static get type(): TradeType;
    protected readonly contractAddress = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
