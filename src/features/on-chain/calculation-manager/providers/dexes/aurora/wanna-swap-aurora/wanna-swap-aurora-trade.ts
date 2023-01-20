import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { WANNA_SWAP_AURORA_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/wanna-swap-aurora/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class WannaSwapAuroraTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.WANNA_SWAP;
    }

    public readonly dexContractAddress = WANNA_SWAP_AURORA_CONTRACT_ADDRESS;
}
