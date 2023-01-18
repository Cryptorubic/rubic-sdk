// import { orders } from '__tests__/unit-tests/features/limit-order/constants/limit-orders';
// import { LimitOrderManager } from 'src/features/limit-order/limit-order-manager';
//
// describe('Limit Order Manager integration tests', () => {
//     let manager: LimitOrderManager;
//
//     beforeAll(() => {
//         manager = new LimitOrderManager();
//     });
//
//     test('Sort limit orders', async () => {
//         const limitOrders = [...orders];
//         apiService['sortOrders'](limitOrders);
//         limitOrders.forEach((order, index) => {
//             if (index === limitOrders.length - 1) {
//                 return;
//             }
//             const nextOrder = limitOrders[index + 1];
//             expect(order.creation.getTime()).toBeGreaterThanOrEqual(nextOrder.creation.getTime());
//         });
//     });
// });
