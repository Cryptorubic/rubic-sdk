import { PANGOLIN_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/avalanche/pangolin/constants';
import { AVAX_ABI } from '@features/instant-trades/dexes/avalanche/avax-abi';
import { AVALANCHE_SWAP_METHOD } from '@features/instant-trades/dexes/avalanche/swap-methods';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';

export class PangolinTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = AVAX_ABI;

    public static readonly swapMethods = AVALANCHE_SWAP_METHOD;

    public static get type(): TradeType {
        return TRADE_TYPE.PANGOLIN;
    }

    protected readonly contractAddress = PANGOLIN_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
