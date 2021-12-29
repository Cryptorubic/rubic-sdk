import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { QUICK_SWAP_CONTRACT_ADDRESS } from '@features/swap/dexes/polygon/quick-swap/constants';
import { TRADE_TYPE, TradeType } from 'src/features';

export class QuickSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.QUICK_SWAP;
    }

    protected readonly contractAddress = QUICK_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
