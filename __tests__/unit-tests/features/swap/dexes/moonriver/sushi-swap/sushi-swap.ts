import { BLOCKCHAIN_NAME } from 'src/core';
import { SUSHI_SWAP_MOONRIVER_PROVIDER_CONFIGURATION } from 'src/features/swap/dexes/moonriver/sushi-swap-moonriver/constants';
import { SushiSwapMoonriverTrade } from 'src/features/swap/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-trade';
import { SushiSwapMoonriverProvider } from 'src/features/swap/dexes/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-provider';

export const sushiSwapMoonriverProviderSpec = () => {
    describe('SushiSwap provider tests', () => {
        let sushiSwapProvider: SushiSwapMoonriverProvider;

        beforeEach(async () => {
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
