import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { ViperSwapHarmonyTrade } from '@rsdk-features/instant-trades/dexes/harmony/viper-swap-harmony/viper-swap-harmony-trade';
import { VIPER_SWAP_HARMONY_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/harmony/viper-swap-harmony/constants';

export class ViperSwapHarmonyProvider extends UniswapV2AbstractProvider<ViperSwapHarmonyTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.HARMONY;

    public readonly InstantTradeClass = ViperSwapHarmonyTrade;

    public readonly providerSettings = VIPER_SWAP_HARMONY_PROVIDER_CONFIGURATION;
}
