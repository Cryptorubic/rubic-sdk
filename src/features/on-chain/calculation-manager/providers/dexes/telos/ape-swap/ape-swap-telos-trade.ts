import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { APE_SWAP_TELOS_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/ape-swap/constants';

export class ApeSwapTelosTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.APE_SWAP;
    }

    public readonly dexContractAddress = APE_SWAP_TELOS_CONTRACT_ADDRESS;
}
