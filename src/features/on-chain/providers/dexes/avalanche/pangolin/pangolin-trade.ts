import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { PANGOLIN_CONTRACT_ADDRESS } from 'src/features/on-chain/providers/dexes/avalanche/pangolin/constants';
import { AVAX_ABI } from 'src/features/on-chain/providers/dexes/avalanche/avax-abi';
import { AVALANCHE_SWAP_METHOD } from 'src/features/on-chain/providers/dexes/avalanche/swap-methods';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/providers/models/on-chain-trade-type';

export class PangolinTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = AVAX_ABI;

    public static readonly swapMethods = AVALANCHE_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANGOLIN;
    }

    protected readonly contractAddress = PANGOLIN_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
