import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapFantomTrade } from './sushi-swap-fantom-trade';
export declare class SushiSwapFantomProvider extends UniswapV2AbstractProvider<SushiSwapFantomTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.FANTOM;
    readonly InstantTradeClass: typeof SushiSwapFantomTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
