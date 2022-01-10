import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TradeType } from '../../../..';
export declare class PancakeSwapTrade extends UniswapV2AbstractTrade {
    static get type(): TradeType;
    protected readonly contractAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
