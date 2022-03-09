import { uniswapV3PolygonTradeSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/uni-swap-v3/uni-swap-v3-polygon-trade';
import { uniswapV3PolygonProviderSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/uni-swap-v3/uni-swap-v3-polygon-provider';
import { quickSwapPolygonProviderSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/quick-swap/quick-swap';
import { sushiSwapPolygonProviderSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/sushi-swap/sushi-swap';
import { oneinchPolygonProviderSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/one-inch/one-inch';
import { algebraPolygonProviderSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/algebra/algebra-provider';
import { algebraPolygonTradeSpec } from '__tests__/unit-tests/features/swap/dexes/polygon/algebra/algebra-trade';

describe('Polygon tests', () => {
    // uniswapV3PolygonProviderSpec();
    // uniswapV3PolygonTradeSpec();
    //
    // algebraPolygonProviderSpec();
    // algebraPolygonTradeSpec();

    quickSwapPolygonProviderSpec();
    sushiSwapPolygonProviderSpec();

    oneinchPolygonProviderSpec();
});
