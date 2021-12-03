import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { QUICK_SWAP_CONTRACT_ADDRESS } from '@features/swap/trades/polygon/quick-swap/constants';

export class QuickSwapTrade extends UniswapV2AbstractTrade {
    protected contractAddress = QUICK_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
