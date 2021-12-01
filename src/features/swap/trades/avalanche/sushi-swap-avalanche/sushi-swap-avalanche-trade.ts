import { SUSHI_SWAP_AVALANCHE_CONTRACT_ADDRESS } from '@features/swap/trades/avalanche/sushi-swap-avalanche/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';

export class SushiSwapAvalancheTrade extends UniswapV2AbstractTrade {
    protected contractAddress = SUSHI_SWAP_AVALANCHE_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
