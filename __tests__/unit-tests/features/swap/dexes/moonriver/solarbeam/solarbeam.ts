import { SolarbeamProvider } from 'src/features/on-chain/providers/dexes/moonriver/solarbeam/solarbeam-provider';
import { SolarbeamTrade } from 'src/features/on-chain/providers/dexes/moonriver/solarbeam/solarbeam-trade';
import { SOLARBEAM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/providers/dexes/moonriver/solarbeam/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const solarbeamMoonriverProviderSpec = () => {
    describe('Solarbeam provider tests', () => {
        let solarbeamProvider: SolarbeamProvider;

        beforeAll(async () => {
            solarbeamProvider = new SolarbeamProvider();
        });

        test('Initialize values', () => {
            expect(solarbeamProvider.blockchain).toBe(BLOCKCHAIN_NAME.MOONRIVER);
            expect(typeof solarbeamProvider.UniswapV2TradeClass).toBe(typeof SolarbeamTrade);
            expect(solarbeamProvider.providerSettings).toBe(SOLARBEAM_PROVIDER_CONFIGURATION);
        }, 400_000);
    });
};
