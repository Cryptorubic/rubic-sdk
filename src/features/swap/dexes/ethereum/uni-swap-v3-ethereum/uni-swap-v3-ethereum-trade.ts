import { TRADE_TYPE, TradeType } from 'src/features';
import {
    UniswapV3AbstractTrade,
    UniswapV3TradeStruct
} from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';

export class UniSwapV3EthereumTrade extends UniswapV3AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.UNI_SWAP_V3_ETHEREUM;
    }

    constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct);
    }
}
