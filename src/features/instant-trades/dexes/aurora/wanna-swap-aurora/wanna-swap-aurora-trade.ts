import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';
import { WANNA_SWAP_AURORA_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/aurora/wanna-swap-aurora/constants';

export class WannaSwapAuroraTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.WANNA_SWAP;
    }

    protected readonly contractAddress = WANNA_SWAP_AURORA_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
