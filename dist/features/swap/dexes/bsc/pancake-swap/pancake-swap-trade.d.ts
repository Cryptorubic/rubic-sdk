import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
export declare class PancakeSwapTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
