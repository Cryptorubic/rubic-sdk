import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';
import { ZAPPY_CONTRACT_ADDRESS } from '@rsdk-features/instant-trades/dexes/telos/zappy/constants';

export class ZappyTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.ZAPPY;
    }

    protected readonly contractAddress = ZAPPY_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
