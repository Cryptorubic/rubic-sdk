import { TRADE_TYPE } from 'src/features';
import { BLOCKCHAIN_NAME } from 'src/core';
import { OneinchPolygonProvider } from 'src/features/instant-trades/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { mockEmptyInjector } from '__tests__/utils/mock-injector';

export const oneinchPolygonProviderSpec = () => {
    describe('QuickSwap provider tests', () => {
        let oneinchPolygonProvider: OneinchPolygonProvider;

        beforeAll(() => {
            mockEmptyInjector();
            oneinchPolygonProvider = new OneinchPolygonProvider();
        });

        test('Initialize values', () => {
            expect(oneinchPolygonProvider.type).toBe(TRADE_TYPE.ONE_INCH_POLYGON);
            expect(oneinchPolygonProvider.blockchain).toBe(BLOCKCHAIN_NAME.POLYGON);
        }, 400_000);
    });
};
