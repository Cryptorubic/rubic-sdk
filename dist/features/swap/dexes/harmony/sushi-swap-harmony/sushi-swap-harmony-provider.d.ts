import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapHarmonyTrade } from './sushi-swap-harmony-trade';
export declare class SushiSwapHarmonyProvider extends UniswapV2AbstractProvider<SushiSwapHarmonyTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.HARMONY;
    readonly InstantTradeClass: typeof SushiSwapHarmonyTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
