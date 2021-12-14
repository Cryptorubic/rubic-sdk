import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SPOOKY_SWAP_CONTRACT_ADDRESS } from '@features/swap/dexes/fantom/spooky-swap/constants';

export class SpookySwapTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SPOOKY_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
