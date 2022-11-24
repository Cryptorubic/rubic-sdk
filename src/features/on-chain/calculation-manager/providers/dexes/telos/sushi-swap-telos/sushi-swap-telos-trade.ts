import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { SUSHI_SWAP_TELOS_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/sushi-swap-telos/constants';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export class SushiSwapTelosTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SUSHI_SWAP;
    }

    public readonly dexContractAddress = SUSHI_SWAP_TELOS_CONTRACT_ADDRESS;
}
