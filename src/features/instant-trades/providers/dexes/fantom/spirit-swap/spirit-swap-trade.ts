import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SPIRIT_SWAP_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/fantom/spirit-swap/constants';

export class SpiritSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SPIRIT_SWAP;
    }

    protected readonly contractAddress = SPIRIT_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
