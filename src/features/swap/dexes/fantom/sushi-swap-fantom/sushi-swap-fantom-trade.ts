import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_FANTOM_CONTRACT_ADDRESS } from '@features/swap/dexes/fantom/sushi-swap-fantom/constants';
import { TRADE_TYPE, TradeType } from 'src/features';

export class SushiSwapFantomTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.SUSHI_SWAP_FANTOM;
    }

    protected readonly contractAddress = SUSHI_SWAP_FANTOM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
