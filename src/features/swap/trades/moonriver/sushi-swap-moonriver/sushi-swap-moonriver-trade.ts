import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_MOONRIVER_CONTRACT_ADDRESS } from '@features/swap/trades/moonriver/sushi-swap-moonriver/constants';

export class SushiSwapMoonriverTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SUSHI_SWAP_MOONRIVER_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
