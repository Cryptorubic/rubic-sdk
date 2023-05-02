import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { PANCAKE_SWAP_TESTNET_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/pancake-swap-testnet/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class PancakeSwapTestnetTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    public readonly dexContractAddress = PANCAKE_SWAP_TESTNET_CONTRACT_ADDRESS;
}
