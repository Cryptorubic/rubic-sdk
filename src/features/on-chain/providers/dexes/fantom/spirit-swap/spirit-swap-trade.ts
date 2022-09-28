import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/providers/models/on-chain-trade-type';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SPIRIT_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/providers/dexes/fantom/spirit-swap/constants';

export class SpiritSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP;
    }

    protected readonly contractAddress = SPIRIT_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
