import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { QuickSwapTrade } from '@features/swap/dexes/polygon/quick-swap/quick-swap-trade';
export declare class QuickSwapProvider extends UniswapV2AbstractProvider<QuickSwapTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.POLYGON;
    readonly InstantTradeClass: typeof QuickSwapTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
