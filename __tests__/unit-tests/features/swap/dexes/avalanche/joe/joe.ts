import { BLOCKCHAIN_NAME } from 'src/core';
import { JoeProvider } from 'src/features/instant-trades/dexes/avalanche/joe/joe-provider';
import { JoeTrade } from 'src/features/instant-trades/dexes/avalanche/joe/joe-trade';
import { JOE_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/avalanche/joe/constants';

export const joeAvalancheProviderSpec = () => {
    describe('Joe provider tests', () => {
        let joeProvider: JoeProvider;

        beforeEach(() => {
            joeProvider = new JoeProvider();
        });

        test('Initialize values', () => {
            expect(joeProvider.blockchain).toBe(BLOCKCHAIN_NAME.AVALANCHE);
            expect(typeof joeProvider.InstantTradeClass).toBe(typeof JoeTrade);
            expect(joeProvider.providerSettings).toBe(JOE_PROVIDER_CONFIGURATION);
        });
    });
};
