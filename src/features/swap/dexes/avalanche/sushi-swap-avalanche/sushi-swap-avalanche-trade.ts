import { SUSHI_SWAP_AVALANCHE_CONTRACT_ADDRESS } from '@features/swap/dexes/avalanche/sushi-swap-avalanche/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class SushiSwapAvalancheTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SUSHI_SWAP_AVALANCHE_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
