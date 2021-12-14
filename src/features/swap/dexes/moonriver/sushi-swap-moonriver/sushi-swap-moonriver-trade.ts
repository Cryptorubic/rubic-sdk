import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_MOONRIVER_CONTRACT_ADDRESS } from '@features/swap/dexes/moonriver/sushi-swap-moonriver/constants';

export class SushiSwapMoonriverTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SUSHI_SWAP_MOONRIVER_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
