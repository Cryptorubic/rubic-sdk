import { BLOCKCHAIN_NAME } from 'src/core';
import { SushiSwapFantomProvider } from 'src/features/instant-trades/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-provider';
import { SushiSwapFantomTrade } from 'src/features/instant-trades/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-trade';
import { SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/fantom/sushi-swap-fantom/constants';


export const sushiSwapFantomProviderSpec = () => {
    let sushiSwapProvider: SushiSwapFantomProvider;

    beforeEach(() => {
        sushiSwapProvider = new SushiSwapFantomProvider();
    });

    test('Initialize values', () => {
        expect(sushiSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.FANTOM);
        expect(typeof sushiSwapProvider.InstantTradeClass).toBe(typeof SushiSwapFantomTrade);
        expect(sushiSwapProvider.providerSettings).toBe(SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION);
    });
};
