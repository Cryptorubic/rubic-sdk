import { SushiSwapEthereumProvider } from 'src/features/instant-trades/dexes/ethereum/sushi-swap-ethereum/sushi-swap-ethereum-provider';
import { SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum/sushi-swap-ethereum/constants';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';

export const sushiSwapProviderEthereumSpec = () => {
    let sushiSwapProvider: SushiSwapEthereumProvider;

    beforeAll(() => {
        sushiSwapProvider = new SushiSwapEthereumProvider();
    });

    test('Initialize values', () => {
        expect(sushiSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.ETHEREUM);
        expect(typeof sushiSwapProvider.InstantTradeClass).toBe(typeof SushiSwapEthereumProvider);
        expect(sushiSwapProvider.providerSettings).toBe(SUSHI_SWAP_ETHEREUM_PROVIDER_CONFIGURATION);
    });
};
