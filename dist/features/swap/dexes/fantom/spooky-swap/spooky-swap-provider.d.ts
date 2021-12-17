import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SpookySwapTrade } from '@features/swap/dexes/fantom/spooky-swap/spooky-swap-trade';
export declare class SpookySwapProvider extends UniswapV2AbstractProvider<SpookySwapTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.FANTOM;
    readonly InstantTradeClass: typeof SpookySwapTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
