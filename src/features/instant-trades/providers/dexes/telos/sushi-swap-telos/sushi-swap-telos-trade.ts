import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_TELOS_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/telos/sushi-swap-telos/constants';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';

export class SushiSwapTelosTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP;
    }

    protected readonly contractAddress = SUSHI_SWAP_TELOS_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
