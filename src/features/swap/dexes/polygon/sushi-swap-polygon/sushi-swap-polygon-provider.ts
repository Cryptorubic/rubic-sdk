import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION } from '@features/swap/dexes/polygon/sushi-swap-polygon/constants';
import { SushiSwapPolygonTrade } from '@features/swap/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-trade';

export class SushiSwapPolygonProvider extends UniswapV2AbstractProvider<SushiSwapPolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    public readonly InstantTradeClass = SushiSwapPolygonTrade;

    public readonly providerSettings = SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION;
}
