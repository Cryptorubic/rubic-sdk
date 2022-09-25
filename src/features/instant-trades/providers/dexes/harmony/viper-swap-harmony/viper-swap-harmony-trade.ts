import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { VIPER_SWAP_HARMONY_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/harmony/viper-swap-harmony/constants';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';

export class ViperSwapHarmonyTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.VIPER_SWAP;
    }

    protected readonly contractAddress = VIPER_SWAP_HARMONY_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
