import { LimitOrderApiService } from 'src/features/limit-order/limit-order-api-service';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    orderApi,
    orderParsed,
    userAddress
} from '__tests__/api-tests/limit-order/constants/user-data';
import { SDK } from 'src/core/sdk/sdk';
import { sdkConfiguration } from '__tests__/api-tests/limit-order/constants/sdk-configuration';
import { Any } from 'src/common/utils/types';

describe('Limit Order Api Service integration tests', () => {
    let apiService: LimitOrderApiService;

    beforeEach(async () => {
        await SDK.createSDK(sdkConfiguration);
        apiService = new LimitOrderApiService();
    });

    test('Get not empty array of polygon orders', async () => {
        const orders = await apiService['getApiOrders'](
            blockchainId[BLOCKCHAIN_NAME.POLYGON],
            userAddress
        );
        expect(orders.length).toBeGreaterThan(0);
        const order = orders.find(v => v.orderHash === orderApi.orderHash);
        expect(order).toMatchObject({ ...orderApi, makerBalance: order?.makerBalance });
    });

    test('Get empty array of ethereum orders', async () => {
        const orders = await apiService['getApiOrders'](
            blockchainId[BLOCKCHAIN_NAME.ETHEREUM],
            userAddress
        );
        expect(orders.length).toBe(0);
    });

    test('Catch error on getting orders with invalid parameters', async () => {
        await expect(apiService['getApiOrders'](-1, userAddress)).rejects.toThrow();
    });

    test('Parse api limit order', async () => {
        const limitOrder = await apiService['parseLimitOrder'](BLOCKCHAIN_NAME.POLYGON, orderApi);
        expect(limitOrder).toEqual(orderParsed);
    });

    test('Get order by hash', async () => {
        const getApiOrdersFn = jest.spyOn(apiService as Any, 'getApiOrders');
        const order = await apiService.getOrderByHash(
            userAddress,
            BLOCKCHAIN_NAME.POLYGON,
            orderApi.orderHash
        );
        expect(getApiOrdersFn).toBeCalled();
        expect(order).toMatchObject({ ...orderApi, makerBalance: order?.makerBalance });
    });

    test('Get null by invalid order hash', async () => {
        const order = await apiService.getOrderByHash(
            userAddress,
            BLOCKCHAIN_NAME.POLYGON,
            `${orderApi.orderHash}_invalid`
        );
        expect(order).toBeNull();
    });

    test('Get null, because user does not have order', async () => {
        const order = await apiService.getOrderByHash(
            `${userAddress}_invalid`,
            BLOCKCHAIN_NAME.POLYGON,
            orderApi.orderHash
        );
        expect(order).toBeNull();
    });

    test('Get not empty array of user orders', async () => {
        const getApiOrdersFn = jest.spyOn(apiService as Any, 'getApiOrders');
        const parseLimitOrderFn = jest.spyOn(apiService as Any, 'parseLimitOrder');
        const orders = await apiService.getUserOrders(userAddress);

        expect(getApiOrdersFn).toBeCalled();
        expect(parseLimitOrderFn).toBeCalled();

        expect(orders.length).toBeGreaterThan(0);
        const order = orders.find(v => v.hash === orderParsed.hash);
        expect(order).toEqual({ ...orderParsed, fromBalance: order?.fromBalance });
    });

    test('Get empty array of invalid user orders', async () => {
        const getApiOrdersFn = jest.spyOn(apiService as Any, 'getApiOrders');
        const parseLimitOrderFn = jest.spyOn(apiService as Any, 'parseLimitOrder');
        const orders = await apiService.getUserOrders(`${userAddress}_invalid`);

        expect(getApiOrdersFn).toBeCalled();
        expect(parseLimitOrderFn).not.toBeCalled();

        expect(orders.length).toBe(0);
    });
});
