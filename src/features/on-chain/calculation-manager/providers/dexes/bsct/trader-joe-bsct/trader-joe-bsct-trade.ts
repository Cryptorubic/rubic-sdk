import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AVAX_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/avax-abi';
import { AVALANCHE_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/swap-methods';
import { TRADER_JOE_BSCT_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/trader-joe-bsct/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class TraderJoeBsctTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    public readonly dexContractAddress = TRADER_JOE_BSCT_CONTRACT_ADDRESS;

    public static readonly contractAbi = AVAX_ABI;

    public static readonly swapMethods = AVALANCHE_SWAP_METHOD;
}
