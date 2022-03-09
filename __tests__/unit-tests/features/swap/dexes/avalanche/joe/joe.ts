import { JoeProvider } from 'src/features/swap/dexes/avalanche/joe/joe-provider';
import { BLOCKCHAIN_NAME } from 'src/core';
import { JoeTrade } from 'src/features/swap/dexes/avalanche/joe/joe-trade';
import { JOE_PROVIDER_CONFIGURATION } from 'src/features/swap/dexes/avalanche/joe/constants';

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
