import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapPolygonTrade } from '@features/swap/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-trade';
export declare class SushiSwapPolygonProvider extends UniswapV2AbstractProvider<SushiSwapPolygonTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.POLYGON;
    readonly InstantTradeClass: typeof SushiSwapPolygonTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
