import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { QUICK_SWAP_MUMBAI_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/mumbai/quick-swap-mumbai/constants';

export class QuickSwapMumbaiTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.QUICK_SWAP;
    }

    public readonly dexContractAddress = QUICK_SWAP_MUMBAI_CONTRACT_ADDRESS;
}
