import { BLOCKCHAIN_NAME } from 'src/core';
import { SpiritSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/spirit-swap/spirit-swap-provider';
import { SpiritSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/spirit-swap/spirit-swap-trade';
import { SPIRIT_SWAP_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/fantom/spirit-swap/constants';

export const spiritSwapFantomProviderSpec = () => {
    let spiritSwapProvider: SpiritSwapProvider;

    beforeAll(() => {
        spiritSwapProvider = new SpiritSwapProvider();
    });

    test('Initialize values', () => {
        expect(spiritSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.FANTOM);
        expect(typeof spiritSwapProvider.UniswapV2TradeClass).toBe(typeof SpiritSwapTrade);
        expect(spiritSwapProvider.providerSettings).toBe(SPIRIT_SWAP_PROVIDER_CONFIGURATION);
    });
};
