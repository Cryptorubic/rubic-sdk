import { PancakeSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-swap/pancake-swap-provider';
import { PancakeSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-swap/pancake-swap-trade';
import { PANCAKE_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-swap/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const pancakeSwapBscProviderSpec = () => {
    let pancakeSwapProvider: PancakeSwapProvider;

    beforeAll(() => {
        pancakeSwapProvider = new PancakeSwapProvider();
    });

    test('Initialize values', () => {
        expect(pancakeSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
        expect(typeof pancakeSwapProvider.UniswapV2TradeClass).toBe(typeof PancakeSwapTrade);
        expect(pancakeSwapProvider.providerSettings).toBe(PANCAKE_SWAP_PROVIDER_CONFIGURATION);
    });
};
