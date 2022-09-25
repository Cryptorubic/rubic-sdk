import { ViperSwapHarmonyTrade } from 'src/features/instant-trades/providers/dexes/harmony/viper-swap-harmony/viper-swap-harmony-trade';
import { VIPER_SWAP_HARMONY_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/harmony/viper-swap-harmony/constants';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class ViperSwapHarmonyProvider extends UniswapV2AbstractProvider<ViperSwapHarmonyTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.HARMONY;

    public readonly InstantTradeClass = ViperSwapHarmonyTrade;

    public readonly providerSettings = VIPER_SWAP_HARMONY_PROVIDER_CONFIGURATION;
}
