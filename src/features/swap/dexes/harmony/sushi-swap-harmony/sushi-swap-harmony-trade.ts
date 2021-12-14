import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_HARMONY_CONTRACT_ADDRESS } from '@features/swap/dexes/harmony/sushi-swap-harmony/constants';

export class SushiSwapHarmonyTrade extends UniswapV2AbstractTrade {
    protected readonly contractAddress = SUSHI_SWAP_HARMONY_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
