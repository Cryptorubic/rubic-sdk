import { pancakeSwapBscProviderSpec } from '__tests__/unit-tests/features/swap/dexes/bsc/pancake-swap/pancake-swap';
import { sushiSwapBscProviderSpec } from '__tests__/unit-tests/features/swap/dexes/bsc/sushi-swap/sushi-swap';
import { oneinchBscProviderSpec } from '__tests__/unit-tests/features/swap/dexes/bsc/one-inch/one-inch';

describe('BSC tests', () => {
    pancakeSwapBscProviderSpec();
    sushiSwapBscProviderSpec();
    oneinchBscProviderSpec();
});
