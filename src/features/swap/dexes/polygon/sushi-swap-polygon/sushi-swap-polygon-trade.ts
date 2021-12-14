import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_POLYGON_CONTRACT_ADDRESS } from '@features/swap/dexes/polygon/sushi-swap-polygon/constants';
import { TRADE_TYPE } from '@features/swap/models/trade-type';

export class SushiSwapPolygonTrade extends UniswapV2AbstractTrade {
    public readonly tradeType = TRADE_TYPE.SUSHI_SWAP_POLYGON;

    protected readonly contractAddress = SUSHI_SWAP_POLYGON_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
