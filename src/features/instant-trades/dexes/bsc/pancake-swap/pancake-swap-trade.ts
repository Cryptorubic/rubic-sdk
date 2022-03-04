import { PANCAKE_SWAP_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/bsc/pancake-swap/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';

export class PancakeSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.PANCAKE_SWAP;
    }

    protected readonly contractAddress = PANCAKE_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
