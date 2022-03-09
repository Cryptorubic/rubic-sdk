import { BLOCKCHAIN_NAME } from 'src/core';
import { TRADE_TYPE } from 'src/features';
import { OneinchEthereumProvider } from 'src/features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';

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
