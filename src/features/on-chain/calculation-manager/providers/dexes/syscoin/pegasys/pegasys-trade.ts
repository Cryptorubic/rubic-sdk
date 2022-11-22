import {
    UniswapV2AbstractTrade,
    UniswapV2TradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { PEGASYS_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/pegasys/constants';
import { SYS_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/syscoin-swap-method';
import { SYS_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/syscoin-abi';

export class PegasysTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = SYS_ABI;

    public static readonly swapMethods = SYS_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PEGASYS;
    }

    public readonly contractAddress = PEGASYS_CONTRACT_ADDRESS;

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct);
    }
}
