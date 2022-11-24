import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/sushi-swap-polygon/constants';
import { SushiSwapPolygonTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-trade';

export class SushiSwapPolygonProvider extends UniswapV2AbstractProvider<SushiSwapPolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    public readonly UniswapV2TradeClass = SushiSwapPolygonTrade;

    public readonly providerSettings = SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION;
}
