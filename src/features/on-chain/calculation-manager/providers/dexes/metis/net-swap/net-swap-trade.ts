import { NET_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/metis/net-swap/constants';
import { METIS_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/metis/metis-abi';
import { METIS_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/metis/metis-swap-methods';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class NetSwapTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = METIS_ABI;

    public static readonly swapMethods = METIS_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.NET_SWAP;
    }

    public readonly dexContractAddress = NET_SWAP_CONTRACT_ADDRESS;
}
