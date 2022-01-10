import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TradeType } from '../../../..';
export declare class SushiSwapPolygonTrade extends UniswapV2AbstractTrade {
    static get type(): TradeType;
    protected readonly contractAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
