import { BLOCKCHAIN_NAME } from 'src/core';
import { SpiritSwapProvider } from 'src/features/instant-trades/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SpookySwapTrade } from 'src/features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-trade';
import { SPOOKY_SWAP_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/fantom/spooky-swap/constants';

export const spookySwapFantomProviderSpec = () => {
    let spookySwapProvider: SpiritSwapProvider;

    beforeEach(() => {
        spookySwapProvider = new SpiritSwapProvider();
    });

    test('Initialize values', () => {
        expect(spookySwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.FANTOM);
        expect(typeof spookySwapProvider.InstantTradeClass).toBe(typeof SpookySwapTrade);
        expect(spookySwapProvider.providerSettings).toBe(SPOOKY_SWAP_PROVIDER_CONFIGURATION);
    });
};
