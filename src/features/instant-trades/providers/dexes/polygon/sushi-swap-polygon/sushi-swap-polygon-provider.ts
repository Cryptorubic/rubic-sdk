import { SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/polygon/sushi-swap-polygon/constants';
import { SushiSwapPolygonTrade } from 'src/features/instant-trades/providers/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-trade';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class SushiSwapPolygonProvider extends UniswapV2AbstractProvider<SushiSwapPolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    public readonly InstantTradeClass = SushiSwapPolygonTrade;

    public readonly providerSettings = SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION;
}
