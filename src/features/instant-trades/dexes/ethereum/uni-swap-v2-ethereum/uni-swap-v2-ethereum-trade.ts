import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { UNISWAP_V2_ETHEREUM_CONTRACT_ADDRESS } from '@rsdk-features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/constants';
import { TRADE_TYPE, TradeType } from 'src/features';

export class UniSwapV2EthereumTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.UNISWAP_V2;
    }

    protected readonly contractAddress = UNISWAP_V2_ETHEREUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
