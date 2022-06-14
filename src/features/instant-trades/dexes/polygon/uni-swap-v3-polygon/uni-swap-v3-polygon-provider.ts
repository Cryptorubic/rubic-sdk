import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniSwapV3PolygonTrade } from '@features/instant-trades/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-trade';
import { UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/polygon/uni-swap-v3-polygon/constants/provider-configuration';
import { UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION } from '@features/instant-trades/dexes/polygon/uni-swap-v3-polygon/constants/router-configuration';

export class UniSwapV3PolygonProvider extends UniswapV3AbstractProvider<UniSwapV3PolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly InstantTradeClass = UniSwapV3PolygonTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION;
}
