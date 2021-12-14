import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { UNISWAP_ETHEREUM_CONTRACT_ADDRESS } from '@features/swap/dexes/ethereum/uni-swap-v2/constants';
import { TRADE_TYPE } from '@features/swap/models/trade-type';

export class UniSwapV2Trade extends UniswapV2AbstractTrade {
    public readonly tradeType = TRADE_TYPE.UNISWAP_V2;

    protected readonly contractAddress = UNISWAP_ETHEREUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
