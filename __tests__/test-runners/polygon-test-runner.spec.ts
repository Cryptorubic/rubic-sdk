import { uniswapV3PolygonTradeSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/uni-swap-v3/uni-swap-v3-polygon-trade';
import { uniswapV3PolygonProviderSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/uni-swap-v3/uni-swap-v3-polygon-provider';

describe('Polygon tests', () => {
    uniswapV3PolygonProviderSpec();
    uniswapV3PolygonTradeSpec();
});
