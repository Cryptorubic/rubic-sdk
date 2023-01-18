import { LimitOrderApiService } from 'src/features/limit-order/limit-order-api-service';
import { orders } from '__tests__/unit-tests/features/limit-order/constants/limit-orders';

describe('Limit Order Api Service unit tests', () => {
    let apiService: LimitOrderApiService;

    beforeAll(() => {
        apiService = new LimitOrderApiService();
    });

    test('Sort limit orders', async () => {
        const limitOrders = [...orders];
        apiService['sortOrders'](limitOrders);
        limitOrders.forEach((order, index) => {
            if (index === limitOrders.length - 1) {
                return;
            }
            const nextOrder = limitOrders[index + 1];
            expect(order.creation.getTime()).toBeGreaterThanOrEqual(nextOrder.creation.getTime());
        });
    });
});
