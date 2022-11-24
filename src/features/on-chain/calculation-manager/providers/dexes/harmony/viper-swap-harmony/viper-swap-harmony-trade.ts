import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { VIPER_SWAP_HARMONY_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/viper-swap-harmony/constants';

export class ViperSwapHarmonyTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.VIPER_SWAP;
    }

    public readonly dexContractAddress = VIPER_SWAP_HARMONY_CONTRACT_ADDRESS;
}
