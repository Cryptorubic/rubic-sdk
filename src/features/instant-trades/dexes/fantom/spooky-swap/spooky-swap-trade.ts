import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import { SPOOKY_SWAP_CONTRACT_ADDRESS } from 'src/features/instant-trades/dexes/fantom/spooky-swap/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class SpookySwapTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SPOOKY_SWAP;
    }

    protected readonly contractAddress = SPOOKY_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
