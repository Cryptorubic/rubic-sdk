import { UniswapV2AbstractTrade, UniswapV2TradeStruct } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
export declare class PangolinTrade extends UniswapV2AbstractTrade {
    static readonly contractAbi: import("web3-utils").AbiItem[];
    static readonly swapMethods: import("../../common/uniswap-v2-abstract/constants/SWAP_METHOD").ExactInputOutputSwapMethodsList;
    protected readonly contractAddress = "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106";
    constructor(tradeStruct: UniswapV2TradeStruct);
}
