import { OneinchEthereumProvider } from 'src/features/swap/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { BLOCKCHAIN_NAME } from 'src/core';
import { TRADE_TYPE } from 'src/features';

export const oneinchProviderEthereumSpec = () => {
    let oneinchProvider: OneinchEthereumProvider;

    beforeEach(() => {
        oneinchProvider = new OneinchEthereumProvider();
    });

    test('Initialize values', () => {
        expect(oneinchProvider.type).toBe(TRADE_TYPE.ONE_INCH_ETHEREUM);
        expect(oneinchProvider.blockchain).toBe(BLOCKCHAIN_NAME.ETHEREUM);
    });
};
