import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import { QUICK_SWAP_CONTRACT_ADDRESS } from 'src/features/instant-trades/dexes/polygon/quick-swap/constants';

export class QuickSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.QUICK_SWAP;
    }

    protected readonly contractAddress = QUICK_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
