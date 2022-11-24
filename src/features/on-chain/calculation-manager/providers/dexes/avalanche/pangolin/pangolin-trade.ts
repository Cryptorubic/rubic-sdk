import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AVAX_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/avax-abi';
import { PANGOLIN_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/constants';
import { AVALANCHE_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/swap-methods';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class PangolinTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = AVAX_ABI;

    public static readonly swapMethods = AVALANCHE_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANGOLIN;
    }

    public readonly dexContractAddress = PANGOLIN_CONTRACT_ADDRESS;
}
