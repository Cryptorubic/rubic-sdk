import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { PANGOLIN_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/avalanche/pangolin/constants';
import { AVAX_ABI } from 'src/features/instant-trades/providers/dexes/avalanche/avax-abi';
import { AVALANCHE_SWAP_METHOD } from 'src/features/instant-trades/providers/dexes/avalanche/swap-methods';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';

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
