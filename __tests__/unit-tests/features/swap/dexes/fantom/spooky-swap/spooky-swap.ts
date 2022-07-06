import { BLOCKCHAIN_NAME } from 'src/core';
import { SpookySwapTrade } from 'src/features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-trade';
import { SPOOKY_SWAP_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/fantom/spooky-swap/constants';
import { SpookySwapProvider } from '@rsdk-features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-provider';

export const spookySwapFantomProviderSpec = () => {
    let spookySwapProvider: SpookySwapProvider;

    beforeAll(() => {
        spookySwapProvider = new SpookySwapProvider();
    });

    test('Initialize values', () => {
        expect(spookySwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.FANTOM);
        expect(typeof spookySwapProvider.InstantTradeClass).toBe(typeof SpookySwapTrade);
        expect(spookySwapProvider.providerSettings).toBe(SPOOKY_SWAP_PROVIDER_CONFIGURATION);
    });
};
