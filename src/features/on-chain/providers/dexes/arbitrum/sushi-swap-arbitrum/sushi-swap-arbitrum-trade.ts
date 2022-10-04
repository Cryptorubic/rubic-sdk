import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/providers/models/on-chain-trade-type';
import { SUSHI_SWAP_ARBITRUM_CONTRACT_ADDRESS } from 'src/features/on-chain/providers/dexes/arbitrum/sushi-swap-arbitrum/constants';

export class SushiSwapArbitrumTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SUSHI_SWAP;
    }

    protected readonly contractAddress = SUSHI_SWAP_ARBITRUM_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
