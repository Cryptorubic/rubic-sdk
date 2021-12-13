import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { SPOOKY_SWAP_CONTRACT_ADDRESS } from '@features/swap/trades/fantom/spooky-swap/constants';

export class SpookySwapTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SPOOKY_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
