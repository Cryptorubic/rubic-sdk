import { SUSHI_SWAP_AVALANCHE_CONTRACT_ADDRESS } from '@features/swap/dexes/avalanche/sushi-swap-avalanche/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features';

export class SushiSwapAvalancheTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP_AVALANCHE;
    }

    protected readonly contractAddress = SUSHI_SWAP_AVALANCHE_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
