import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_MOONRIVER_CONTRACT_ADDRESS } from '@rsdk-features/instant-trades/dexes/moonriver/sushi-swap-moonriver/constants';
import { TRADE_TYPE, TradeType } from 'src/features';

export class SushiSwapMoonriverTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP_MOONRIVER;
    }

    protected readonly contractAddress = SUSHI_SWAP_MOONRIVER_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
