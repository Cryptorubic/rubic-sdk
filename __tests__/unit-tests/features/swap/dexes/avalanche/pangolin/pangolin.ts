import { PangolinProvider } from 'src/features/swap/dexes/avalanche/pangolin/pangolin-provider';
import { BLOCKCHAIN_NAME } from 'src/core';
import { JoeTrade } from 'src/features/swap/dexes/avalanche/joe/joe-trade';
import { PANGOLIN_PROVIDER_CONFIGURATION } from 'src/features/swap/dexes/avalanche/pangolin/constants';

export const pangolinAvalancheProviderSpec = () => {
    describe('Pangolin provider tests', () => {
        let pangolinProvider: PangolinProvider;

        beforeEach(() => {
            pangolinProvider = new PangolinProvider();
        });

        test('Initialize values', () => {
            expect(pangolinProvider.blockchain).toBe(BLOCKCHAIN_NAME.AVALANCHE);
            expect(typeof pangolinProvider.InstantTradeClass).toBe(typeof JoeTrade);
            expect(pangolinProvider.providerSettings).toBe(PANGOLIN_PROVIDER_CONFIGURATION);
        });
    });
};
