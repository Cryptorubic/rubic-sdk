import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_HARMONY_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/harmony/sushi-swap-harmony/constants';
import { TRADE_TYPE, TradeType } from 'src/features';

export class SushiSwapHarmonyTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP_HARMONY;
    }

    protected readonly contractAddress = SUSHI_SWAP_HARMONY_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
