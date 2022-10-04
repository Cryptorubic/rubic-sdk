import { TRADE_TYPE } from 'src/features';
import { ZrxEthereumProvider } from 'src/features/on-chain/providers/dexes/ethereum/zrx-ethereum/zrx-ethereum-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const zrxProviderEthereumSpec = () => {
    let zrxProvider: ZrxEthereumProvider;

    beforeEach(() => {
        zrxProvider = new ZrxEthereumProvider();
    });

    test('Initialize values', () => {
        expect(zrxProvider.type).toBe(TRADE_TYPE.ZRX_ETHEREUM);
        expect(zrxProvider.blockchain).toBe(BLOCKCHAIN_NAME.ETHEREUM);
    });
};
