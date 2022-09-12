import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';
import { WANNA_SWAP_AURORA_CONTRACT_ADDRESS } from 'src/features/instant-trades/dexes/aurora/wanna-swap-aurora/constants';

export class WannaSwapAuroraTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.WANNA_SWAP;
    }

    protected readonly contractAddress = WANNA_SWAP_AURORA_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
