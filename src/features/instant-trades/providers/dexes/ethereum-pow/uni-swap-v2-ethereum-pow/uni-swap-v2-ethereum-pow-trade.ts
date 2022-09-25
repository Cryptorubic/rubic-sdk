import { UNISWAP_V2_ETHEREUM_POW_CONTRACT_ADDRESS } from 'src/features/instant-trades/providers/dexes/ethereum-pow/uni-swap-v2-ethereum-pow/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/providers/models/trade-type';

export class UniSwapV2EthereumPowTrade extends UniswapV2AbstractTrade {
    public static get type(): TradeType {
        return TRADE_TYPE.UNISWAP_V2;
    }

    protected readonly contractAddress = UNISWAP_V2_ETHEREUM_POW_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
