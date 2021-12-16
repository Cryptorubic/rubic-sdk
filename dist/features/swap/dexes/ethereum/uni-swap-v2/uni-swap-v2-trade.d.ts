import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
export declare class UniSwapV2Trade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
