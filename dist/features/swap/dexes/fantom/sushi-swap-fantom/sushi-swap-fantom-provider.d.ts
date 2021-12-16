import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapFantomTrade } from '@features/swap/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-trade';
export declare class SushiSwapFantomProvider extends UniswapV2AbstractProvider<SushiSwapFantomTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.FANTOM;
    readonly InstantTradeClass: typeof SushiSwapFantomTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
