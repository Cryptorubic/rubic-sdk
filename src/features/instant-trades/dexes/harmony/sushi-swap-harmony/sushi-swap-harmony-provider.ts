import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_HARMONY_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/harmony/sushi-swap-harmony/constants';
import { SushiSwapHarmonyTrade } from '@features/instant-trades/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-trade';

export class SushiSwapHarmonyProvider extends UniswapV2AbstractProvider<SushiSwapHarmonyTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.HARMONY;

    public readonly InstantTradeClass = SushiSwapHarmonyTrade;

    public readonly providerSettings = SUSHI_SWAP_HARMONY_PROVIDER_CONFIGURATION;
}
