import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
export declare class SushiSwapEthereumTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
