import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SpookySwapTrade } from './spooky-swap-trade';
export declare class SpookySwapProvider extends UniswapV2AbstractProvider<SpookySwapTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.FANTOM;
    readonly InstantTradeClass: typeof SpookySwapTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
