import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
export declare class SpiritSwapTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = "0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
