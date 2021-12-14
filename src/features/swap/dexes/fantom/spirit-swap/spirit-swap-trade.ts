import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SPIRIT_SWAP_CONTRACT_ADDRESS } from '@features/swap/dexes/fantom/spirit-swap/constants';

export class SpiritSwapTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SPIRIT_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
