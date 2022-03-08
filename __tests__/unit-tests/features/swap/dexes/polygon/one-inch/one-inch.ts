import { Chain } from '__tests__/utils/chain';
import { TRADE_TYPE } from 'src/features';
import { mockInjector } from '__tests__/utils/mock-injector';
import { OneinchPolygonProvider } from 'src/features/swap/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { BLOCKCHAIN_NAME } from 'src/core';

let oneinchPolygonProvider: OneinchPolygonProvider;

export const oneinchPolygonProviderSpec = () => {
    describe('QuickSwap provider tests', () => {
        beforeAll(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

        beforeEach(async () => {
            oneinchPolygonProvider = new OneinchPolygonProvider();
        });

        test('Initialize values', () => {
            expect(oneinchPolygonProvider.type).toBe(TRADE_TYPE.ONE_INCH_POLYGON);
            expect(oneinchPolygonProvider.blockchain).toBe(BLOCKCHAIN_NAME.POLYGON);
        }, 400_000);
    });
};
