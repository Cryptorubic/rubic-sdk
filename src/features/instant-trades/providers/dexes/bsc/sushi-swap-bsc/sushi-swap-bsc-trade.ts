import { SUSHI_SWAP_BSC_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/bsc/sushi-swap-bsc/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';

export class SushiSwapBscTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP;
    }

    protected readonly contractAddress = SUSHI_SWAP_BSC_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
