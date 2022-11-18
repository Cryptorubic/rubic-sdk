import { JoeProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/joe/joe-provider';
import { JoeTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/joe/joe-trade';
import { JOE_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/joe/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const joeAvalancheProviderSpec = () => {
    describe('Joe provider tests', () => {
        let joeProvider: JoeProvider;

        beforeAll(() => {
            joeProvider = new JoeProvider();
        });

        test('Initialize values', () => {
            expect(joeProvider.blockchain).toBe(BLOCKCHAIN_NAME.AVALANCHE);
            expect(typeof joeProvider.UniswapV2TradeClass).toBe(typeof JoeTrade);
            expect(joeProvider.providerSettings).toBe(JOE_PROVIDER_CONFIGURATION);
        });
    });
};
