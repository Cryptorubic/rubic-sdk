import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TradeType } from '../../../..';
export declare class SpookySwapTrade extends UniswapV2AbstractTrade {
    static get type(): TradeType;
    protected readonly contractAddress = "0xF491e7B69E4244ad4002BC14e878a34207E38c29";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
