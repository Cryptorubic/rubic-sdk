import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TradeType } from '../../../..';
export declare class SushiSwapEthereumTrade extends UniswapV2AbstractTrade {
    static get type(): TradeType;
    protected readonly contractAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
