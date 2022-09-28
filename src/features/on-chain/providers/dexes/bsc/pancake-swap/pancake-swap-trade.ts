import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { PANCAKE_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/providers/dexes/bsc/pancake-swap/constants';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/providers/models/on-chain-trade-type';

export class PancakeSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    protected readonly contractAddress = PANCAKE_SWAP_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
