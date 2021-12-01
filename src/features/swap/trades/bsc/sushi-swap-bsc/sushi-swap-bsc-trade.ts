import { SUSHI_SWAP_BSC_CONTRACT_ADDRESS } from '@features/swap/trades/bsc/sushi-swap-bsc/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';

export class SushiSwapBscTrade extends UniswapV2AbstractTrade {
    protected contractAddress = SUSHI_SWAP_BSC_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
