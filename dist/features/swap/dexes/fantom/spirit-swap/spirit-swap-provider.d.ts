import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SpiritSwapTrade } from '@features/swap/dexes/fantom/spirit-swap/spirit-swap-trade';
export declare class SpiritSwapProvider extends UniswapV2AbstractProvider<SpiritSwapTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.FANTOM;
    readonly InstantTradeClass: typeof SpiritSwapTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
