import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import { SUSHI_SWAP_ARBITRUM_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/arbitrum/sushi-swap-arbitrum/constants';

export class SushiSwapArbitrumTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP;
    }

    protected readonly contractAddress = SUSHI_SWAP_ARBITRUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
