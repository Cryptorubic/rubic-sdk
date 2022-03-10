import { BLOCKCHAIN_NAME } from 'src/core';
import { SushiSwapAvalancheProvider } from 'src/features/instant-trades/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-provider';
import { SushiSwapAvalancheTrade } from 'src/features/instant-trades/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-trade';
import { SUSHI_SWAP_AVALANCHE_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/avalanche/sushi-swap-avalanche/constants';

export const sushiSwapAvalancheProviderSpec = () => {
    describe('SushiSwap provider tests', () => {
        let sushiSwapProvider: SushiSwapAvalancheProvider;

        beforeAll(() => {
            sushiSwapProvider = new SushiSwapAvalancheProvider();
        });

        test('Initialize values', () => {
            expect(sushiSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.AVALANCHE);
            expect(typeof sushiSwapProvider.InstantTradeClass).toBe(typeof SushiSwapAvalancheTrade);
            expect(sushiSwapProvider.providerSettings).toBe(
                SUSHI_SWAP_AVALANCHE_PROVIDER_CONFIGURATION
            );
        });
    });
};
