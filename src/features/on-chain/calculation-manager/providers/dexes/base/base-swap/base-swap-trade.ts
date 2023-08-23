import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { BASE_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/base/base-swap/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class BaseSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BASE_SWAP;
    }

    public readonly dexContractAddress = BASE_SWAP_CONTRACT_ADDRESS;
}
