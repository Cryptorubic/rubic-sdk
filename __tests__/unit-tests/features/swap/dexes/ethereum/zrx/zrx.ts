import { BLOCKCHAIN_NAME } from 'src/core';
import { ZrxEthereumProvider } from 'src/features/swap/dexes/ethereum/zrx-ethereum/zrx-ethereum-provider';
import { TRADE_TYPE } from 'src/features';

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
