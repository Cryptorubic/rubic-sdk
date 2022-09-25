import { UniswapV3AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/polygon/uni-swap-v3-polygon/constants/router-configuration';
import { UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/polygon/uni-swap-v3-polygon/constants/provider-configuration';
import { UniSwapV3PolygonTrade } from 'src/features/instant-trades/providers/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-trade';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class UniSwapV3PolygonProvider extends UniswapV3AbstractProvider<UniSwapV3PolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly InstantTradeClass = UniSwapV3PolygonTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION;
}
