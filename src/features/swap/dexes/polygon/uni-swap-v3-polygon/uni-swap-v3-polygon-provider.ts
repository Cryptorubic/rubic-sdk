import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV3AbstractProvider } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UniSwapV3PolygonTrade } from '@features/swap/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-trade';
import { UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION } from '@features/swap/dexes/polygon/uni-swap-v3-polygon/constants/provider-configuration';
import { UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION } from '@features/swap/dexes/polygon/uni-swap-v3-polygon/constants/router-configuration';

export class UniSwapV3PolygonProvider extends UniswapV3AbstractProvider<UniSwapV3PolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly InstantTradeClass = UniSwapV3PolygonTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION;
}
