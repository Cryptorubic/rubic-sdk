import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { VIPER_SWAP_HARMONY_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/viper-swap-harmony/constants';
import { ViperSwapHarmonyTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/viper-swap-harmony/viper-swap-harmony-trade';

export class ViperSwapHarmonyProvider extends UniswapV2AbstractProvider<ViperSwapHarmonyTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.HARMONY;

    public readonly UniswapV2TradeClass = ViperSwapHarmonyTrade;

    public readonly providerSettings = VIPER_SWAP_HARMONY_PROVIDER_CONFIGURATION;
}
