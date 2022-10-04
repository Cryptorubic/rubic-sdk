import { SushiSwapHarmonyProvider } from 'src/features/on-chain/providers/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-provider';
import { SushiSwapHarmonyTrade } from 'src/features/on-chain/providers/dexes/harmony/sushi-swap-harmony/sushi-swap-harmony-trade';
import { SUSHI_SWAP_HARMONY_PROVIDER_CONFIGURATION } from 'src/features/on-chain/providers/dexes/harmony/sushi-swap-harmony/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const sushiSwapHarmonyProviderSpec = () => {
    let sushiSwapProvider: SushiSwapHarmonyProvider;

    beforeAll(() => {
        sushiSwapProvider = new SushiSwapHarmonyProvider();
    });

    test('Initialize values', () => {
        expect(sushiSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.HARMONY);
        expect(typeof sushiSwapProvider.UniswapV2TradeClass).toBe(typeof SushiSwapHarmonyTrade);
        expect(sushiSwapProvider.providerSettings).toBe(SUSHI_SWAP_HARMONY_PROVIDER_CONFIGURATION);
    });
};
