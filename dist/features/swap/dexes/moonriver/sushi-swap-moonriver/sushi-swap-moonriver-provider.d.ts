import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapMoonriverTrade } from './sushi-swap-moonriver-trade';
export declare class SushiSwapMoonriverProvider extends UniswapV2AbstractProvider<SushiSwapMoonriverTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.MOONRIVER;
    readonly InstantTradeClass: typeof SushiSwapMoonriverTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
