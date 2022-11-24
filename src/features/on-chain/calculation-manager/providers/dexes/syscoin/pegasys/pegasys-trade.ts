import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { PEGASYS_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/pegasys/constants';
import { SYS_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/syscoin-abi';
import { SYS_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/syscoin-swap-method';

export class PegasysTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = SYS_ABI;

    public static readonly swapMethods = SYS_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PEGASYS;
    }

    public readonly dexContractAddress = PEGASYS_CONTRACT_ADDRESS;
}
