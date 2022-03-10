import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';
import { TRISOLARIS_AURORA_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/aurora/trisolaris-aurora/constants';

export class TrisolarisAuroraTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.TRISOLARIS;
    }

    protected readonly contractAddress = TRISOLARIS_AURORA_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
