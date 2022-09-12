import { SushiSwapMoonriverProvider } from 'src/features/instant-trades/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';
import { SushiSwapMoonriverTrade } from 'src/features/instant-trades/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-trade';
import { SUSHI_SWAP_MOONRIVER_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/moonriver/sushi-swap-moonriver/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const sushiSwapMoonriverProviderSpec = () => {
    describe('SushiSwap provider tests', () => {
        let sushiSwapProvider: SushiSwapMoonriverProvider;

        beforeAll(async () => {
            sushiSwapProvider = new SushiSwapMoonriverProvider();
        });

        test('Initialize values', () => {
            expect(sushiSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.MOONRIVER);
            expect(typeof sushiSwapProvider.InstantTradeClass).toBe(typeof SushiSwapMoonriverTrade);
            expect(sushiSwapProvider.providerSettings).toBe(
                SUSHI_SWAP_MOONRIVER_PROVIDER_CONFIGURATION
            );
        }, 400_000);
    });
};
