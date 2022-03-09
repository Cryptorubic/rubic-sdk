import { BLOCKCHAIN_NAME } from 'src/core';
import { SolarbeamProvider } from 'src/features/swap/dexes/moonriver/solarbeam/solarbeam-provider';
import { SOLARBEAM_PROVIDER_CONFIGURATION } from 'src/features/swap/dexes/moonriver/solarbeam/constants';
import { SolarbeamTrade } from 'src/features/swap/dexes/moonriver/solarbeam/solarbeam-trade';

export const solarbeamMoonriverСonstants = () => {
    describe('QuickSwap provider tests', () => {
        let solarbeamProvider: SolarbeamProvider;

        beforeEach(async () => {
            solarbeamProvider = new SolarbeamProvider();
        });

        test('Initialize values', () => {
            expect(solarbeamProvider.blockchain).toBe(BLOCKCHAIN_NAME.MOONRIVER);
            expect(typeof solarbeamProvider.InstantTradeClass).toBe(typeof SolarbeamTrade);
            expect(solarbeamProvider.providerSettings).toBe(SOLARBEAM_PROVIDER_CONFIGURATION);
        }, 400_000);
    });
};
