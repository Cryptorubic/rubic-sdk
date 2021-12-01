import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_FANTOM_CONTRACT_ADDRESS } from '@features/swap/trades/fantom/sushi-swap-fantom/constants';

export class SushiSwapFantomTrade extends UniswapV2AbstractTrade {
    protected contractAddress = SUSHI_SWAP_FANTOM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
