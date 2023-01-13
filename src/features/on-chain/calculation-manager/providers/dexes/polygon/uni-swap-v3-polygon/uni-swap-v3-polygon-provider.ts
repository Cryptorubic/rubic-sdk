import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-provider';
import { UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/uni-swap-v3-polygon/constants/provider-configuration';
import { UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/uni-swap-v3-polygon/constants/router-configuration';
import { UniSwapV3PolygonTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-trade';

export class UniSwapV3PolygonProvider extends UniswapV3AbstractProvider<UniSwapV3PolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly OnChainTradeClass = UniSwapV3PolygonTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_POLYGON_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_POLYGON_ROUTER_CONFIGURATION;
}
