import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { QUICK_SWAP_CONTRACT_ADDRESS } from '@features/swap/dexes/polygon/quick-swap/constants';
import { TRADE_TYPE } from '@features/swap/models/trade-type';

export class QuickSwapTrade extends UniswapV2AbstractTrade {
    public readonly tradeType = TRADE_TYPE.QUICK_SWAP;

    protected readonly contractAddress = QUICK_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
