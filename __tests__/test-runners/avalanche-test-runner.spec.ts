import { joeAvalancheProviderSpec } from '__tests__/unit-tests/features/swap/dexes/avalanche/joe/joe';
import { pangolinAvalancheProviderSpec } from '__tests__/unit-tests/features/swap/dexes/avalanche/pangolin/pangolin';
import { sushiSwapAvalancheProviderSpec } from '__tests__/unit-tests/features/swap/dexes/avalanche/sushi-swap/sushi-swap';

describe('Avalanche tests', () => {
    joeAvalancheProviderSpec();
    pangolinAvalancheProviderSpec();
    sushiSwapAvalancheProviderSpec();
});
