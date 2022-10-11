import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { WANNA_SWAP_AURORA_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/wanna-swap-aurora/constants';

export class WannaSwapAuroraTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.WANNA_SWAP;
    }

    protected readonly contractAddress = WANNA_SWAP_AURORA_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
