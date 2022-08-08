import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/polygon/sushi-swap-polygon/constants';
import { SushiSwapPolygonTrade } from '@rsdk-features/instant-trades/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-trade';

export class SushiSwapPolygonProvider extends UniswapV2AbstractProvider<SushiSwapPolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    public readonly InstantTradeClass = SushiSwapPolygonTrade;

    public readonly providerSettings = SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION;
}
