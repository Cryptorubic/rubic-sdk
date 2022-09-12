import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OOLONG_SWAP_CONTRACT_ADDRESS } from 'src/features/instant-trades/dexes/boba/oolong-swap/constants';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';

export class OolongSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.OOLONG_SWAP;
    }

    protected readonly contractAddress = OOLONG_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
