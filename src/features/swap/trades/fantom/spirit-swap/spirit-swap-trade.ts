import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { SPIRIT_SWAP_CONTRACT_ADDRESS } from '@features/swap/trades/fantom/spirit-swap/constants';

export class SpiritSwapTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SPIRIT_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
