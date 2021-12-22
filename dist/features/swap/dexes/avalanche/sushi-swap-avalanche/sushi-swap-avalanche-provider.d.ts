import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapAvalancheTrade } from './sushi-swap-avalanche-trade';
export declare class SushiSwapAvalancheProvider extends UniswapV2AbstractProvider<SushiSwapAvalancheTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.AVALANCHE;
    readonly InstantTradeClass: typeof SushiSwapAvalancheTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
