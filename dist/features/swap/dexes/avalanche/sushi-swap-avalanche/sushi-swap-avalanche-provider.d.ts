import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapAvalancheTrade } from '@features/swap/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-trade';
export declare class SushiSwapAvalancheProvider extends UniswapV2AbstractProvider<SushiSwapAvalancheTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;
    readonly InstantTradeClass: typeof SushiSwapAvalancheTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
