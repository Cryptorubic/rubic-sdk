import { BLOCKCHAIN_NAME } from 'src/core';
import { SushiSwapHarmonyProvider } from 'src/features/instant-trades/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { SushiSwapHarmonyTrade } from 'src/features/instant-trades/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-trade';
import { SUSHI_SWAP_HARMONY_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/harmony/sushi-swap-harmony/constants';

export const sushiSwapHarmonyProviderSpec = () => {
    let sushiSwapProvider: SushiSwapHarmonyProvider;

    beforeEach(() => {
        sushiSwapProvider = new SushiSwapHarmonyProvider();
    });

    test('Initialize values', () => {
        expect(sushiSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.HARMONY);
        expect(typeof sushiSwapProvider.InstantTradeClass).toBe(typeof SushiSwapHarmonyTrade);
        expect(sushiSwapProvider.providerSettings).toBe(SUSHI_SWAP_HARMONY_PROVIDER_CONFIGURATION);
    });
};
