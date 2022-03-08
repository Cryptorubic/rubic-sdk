import { Chain } from '__tests__/utils/chain';
import { BLOCKCHAIN_NAME } from 'src/core';
import { mockInjector } from '__tests__/utils/mock-injector';
import { SolarbeamProvider } from 'src/features/swap/dexes/moonriver/solarbeam/solarbeam-provider';
import { SOLARBEAM_PROVIDER_CONFIGURATION } from 'src/features/swap/dexes/moonriver/solarbeam/constants';
import { SolarbeamTrade } from 'src/features/swap/dexes/moonriver/solarbeam/solarbeam-trade';

export const solarbeamMoonriverСonstants = () => {
    describe('QuickSwap provider tests', () => {
        let solarbeamProvider: SolarbeamProvider;

        beforeAll(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

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
