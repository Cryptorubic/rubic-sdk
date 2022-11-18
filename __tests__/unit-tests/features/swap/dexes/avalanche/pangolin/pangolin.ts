import { PangolinProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/pangolin-provider';
import { PangolinTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/pangolin-trade';
import { PANGOLIN_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/pangolin/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const pangolinAvalancheProviderSpec = () => {
    describe('Pangolin provider tests', () => {
        let pangolinProvider: PangolinProvider;

        beforeAll(() => {
            pangolinProvider = new PangolinProvider();
        });

        test('Initialize values', () => {
            expect(pangolinProvider.blockchain).toBe(BLOCKCHAIN_NAME.AVALANCHE);
            expect(typeof pangolinProvider.UniswapV2TradeClass).toBe(typeof PangolinTrade);
            expect(pangolinProvider.providerSettings).toBe(PANGOLIN_PROVIDER_CONFIGURATION);
        });
    });
};
