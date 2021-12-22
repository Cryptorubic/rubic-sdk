import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PancakeSwapTrade } from './pancake-swap-trade';
export declare class PancakeSwapProvider extends UniswapV2AbstractProvider<PancakeSwapTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    readonly InstantTradeClass: typeof PancakeSwapTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
