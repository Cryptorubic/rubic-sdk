import { TRISOLARIS_AURORA_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/trisolaris-aurora/constants';
import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';

export class TrisolarisAuroraTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.TRISOLARIS;
    }

    public readonly contractAddress = TRISOLARIS_AURORA_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
