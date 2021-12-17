import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PancakeSwapTrade } from '@features/swap/dexes/bsc/pancake-swap/pancake-swap-trade';
export declare class PancakeSwapProvider extends UniswapV2AbstractProvider<PancakeSwapTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    readonly InstantTradeClass: typeof PancakeSwapTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
