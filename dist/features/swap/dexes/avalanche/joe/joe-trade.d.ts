import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
export declare class JoeTrade extends UniswapV2AbstractTrade {
    static readonly contractAbi: import("web3-utils").AbiItem[];
    static readonly swapMethods: import("../../common/uniswap-v2-abstract/constants/SWAP_METHOD").ExactInputOutputSwapMethodsList;
    protected contractAddress: string;
    constructor(tradeStruct: UniswapV2TradeStruct);
}
