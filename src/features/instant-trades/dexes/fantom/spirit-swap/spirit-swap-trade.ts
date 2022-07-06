import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SPIRIT_SWAP_CONTRACT_ADDRESS } from '@rsdk-features/instant-trades/dexes/fantom/spirit-swap/constants';
import { TRADE_TYPE, TradeType } from 'src/features';

export class SpiritSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SPIRIT_SWAP;
    }

    protected readonly contractAddress = SPIRIT_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
