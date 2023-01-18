import { LimitOrderApiService } from 'src/features/limit-order/limit-order-api-service';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { orderHash, userData } from '__tests__/api-tests/limit-order/constants/user-data';
import { SDK } from 'src/core/sdk/sdk';
import { sdkConfiguration } from '__tests__/api-tests/limit-order/constants/sdk-configuration';

describe('Limit Order Api Service integration tests', () => {
    let apiService: LimitOrderApiService;

    beforeEach(async () => {
        await SDK.createSDK(sdkConfiguration);
        apiService = new LimitOrderApiService();
    });

    test('Get not empty array of polygon orders', async () => {
        const orders = await apiService['getApiOrders'](
            blockchainId[BLOCKCHAIN_NAME.POLYGON],
            userData
        );
        expect(orders.length).toBeGreaterThan(0);
        const order = orders.find(v => v.orderHash === orderHash);
        expect(order).toBeDefined();
    });

    test('Get empty array of ethereum orders', async () => {
        const orders = await apiService['getApiOrders'](
            blockchainId[BLOCKCHAIN_NAME.ETHEREUM],
            userData
        );
        expect(orders.length).toBe(0);
    });

    test('Catch error on getting orders with invalid parameters', async () => {
        let err: Error | undefined;
        try {
            await apiService['getApiOrders'](-1, userData);
        } catch (apiErr) {
            err = apiErr;
        }
        expect(err).toBeDefined();
    });
});
