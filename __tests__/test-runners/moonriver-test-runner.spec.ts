import { solarbeamMoonriverProviderSpec } from '__tests__/unit-tests/features/swap/dexes/moonriver/solarbeam/solarbeam';
import { sushiSwapMoonriverProviderSpec } from '__tests__/unit-tests/features/swap/dexes/moonriver/sushi-swap/sushi-swap';

describe('Moonriver tests', () => {
    solarbeamMoonriverProviderSpec();
    sushiSwapMoonriverProviderSpec();
});
