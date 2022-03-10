import { BLOCKCHAIN_NAME } from 'src/core';
import { TRADE_TYPE } from 'src/features';
import { OneinchBscProvider } from 'src/features/instant-trades/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';

export const oneinchBscProviderSpec = () => {
    let oneinchProvider: OneinchBscProvider;

    beforeEach(() => {
        oneinchProvider = new OneinchBscProvider();
    });

    test('', () => {
        expect(oneinchProvider.type).toBe(TRADE_TYPE.ONE_INCH_BSC);
        expect(oneinchProvider.blockchain).toBe(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
    });
};
