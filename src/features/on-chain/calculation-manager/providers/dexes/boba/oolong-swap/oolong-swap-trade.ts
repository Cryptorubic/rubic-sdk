import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OOLONG_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/boba/oolong-swap/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class OolongSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.OOLONG_SWAP;
    }

    public readonly dexContractAddress = OOLONG_SWAP_CONTRACT_ADDRESS;
}
