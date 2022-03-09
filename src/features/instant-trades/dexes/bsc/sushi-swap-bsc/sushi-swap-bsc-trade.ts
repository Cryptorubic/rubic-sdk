import { SUSHI_SWAP_BSC_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/bsc/sushi-swap-bsc/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';

export class SushiSwapBscTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP_BSC;
    }

    protected readonly contractAddress = SUSHI_SWAP_BSC_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
