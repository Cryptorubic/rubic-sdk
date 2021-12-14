import { PANGOLIN_CONTRACT_ADDRESS } from '@features/swap/dexes/avalanche/pangolin/constants';
import { AVAX_ABI } from '@features/swap/dexes/avalanche/avax-abi';
import { AVALANCHE_SWAP_METHOD } from '@features/swap/dexes/avalanche/swap-methods';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE } from '@features/swap/models/trade-type';

export class PangolinTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = AVAX_ABI;

    public static readonly swapMethods = AVALANCHE_SWAP_METHOD;

    public readonly tradeType = TRADE_TYPE.PANGOLIN;

    protected readonly contractAddress = PANGOLIN_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
