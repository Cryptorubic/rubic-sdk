import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapPolygonTrade } from './sushi-swap-polygon-trade';
export declare class SushiSwapPolygonProvider extends UniswapV2AbstractProvider<SushiSwapPolygonTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.POLYGON;
    readonly InstantTradeClass: typeof SushiSwapPolygonTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
