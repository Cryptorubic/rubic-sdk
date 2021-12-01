import { PANCAKE_SWAP_CONTRACT_ADDRESS } from '@features/swap/trades/bsc/pancake-swap/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';

export class PancakeSwapTrade extends UniswapV2AbstractTrade {
    protected contractAddress = PANCAKE_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
