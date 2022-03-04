import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';
import { VIPER_SWAP_HARMONY_CONTRACT_ADDRESS } from '@features/instant-trades/dexes/harmony/viper-swap-harmony/constants';

export class ViperSwapHarmonyTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.VIPER_SWAP;
    }

    protected readonly contractAddress = VIPER_SWAP_HARMONY_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
