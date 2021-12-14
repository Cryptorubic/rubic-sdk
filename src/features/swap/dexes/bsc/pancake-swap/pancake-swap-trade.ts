import { PANCAKE_SWAP_CONTRACT_ADDRESS } from '@features/swap/dexes/bsc/pancake-swap/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE } from '@features/swap/models/trade-type';

export class PancakeSwapTrade extends UniswapV2AbstractTrade {
    public readonly tradeType = TRADE_TYPE.PANCAKE_SWAP;

    protected readonly contractAddress = PANCAKE_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
