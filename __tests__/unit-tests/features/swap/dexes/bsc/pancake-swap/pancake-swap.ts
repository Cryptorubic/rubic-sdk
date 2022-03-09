import { PancakeSwapProvider } from 'src/features/swap/dexes/bsc/pancake-swap/pancake-swap-provider';
import { BLOCKCHAIN_NAME } from 'src/core';
import { PancakeSwapTrade } from 'src/features/swap/dexes/bsc/pancake-swap/pancake-swap-trade';
import { PANCAKE_SWAP_PROVIDER_CONFIGURATION } from 'src/features/swap/dexes/bsc/pancake-swap/constants';

export const pancakeSwapBscProviderSpec = () => {
    let pancakeSwapProvider: PancakeSwapProvider;

    beforeEach(() => {
        pancakeSwapProvider = new PancakeSwapProvider();
    });

    test('Initialize values', () => {
        expect(pancakeSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
        expect(typeof pancakeSwapProvider.InstantTradeClass).toBe(typeof PancakeSwapTrade);
        expect(pancakeSwapProvider.providerSettings).toBe(PANCAKE_SWAP_PROVIDER_CONFIGURATION);
    });
};
