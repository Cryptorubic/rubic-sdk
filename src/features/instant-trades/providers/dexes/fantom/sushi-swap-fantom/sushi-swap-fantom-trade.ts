import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_FANTOM_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/fantom/sushi-swap-fantom/constants';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';

export class SushiSwapFantomTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP;
    }

    protected readonly contractAddress = SUSHI_SWAP_FANTOM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
