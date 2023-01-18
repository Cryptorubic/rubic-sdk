import { LimitOrder } from 'src/features/limit-order/models/limit-order';
import BigNumber from 'bignumber.js';
import { LIMIT_ORDER_STATUS } from 'src/features/limit-order/models/limit-order-status';
import { TOKENS } from '__tests__/utils/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const orders: LimitOrder[] = [
    {
        hash: '0x7c3923040b40aa6205a4dc6986e5dd8930e7507732a612fb2d532fa4fb14e198',
        creation: new Date('2023-01-12T13:50:31.042Z'),
        fromToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].USDC,
        toToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].DAI,
        fromAmount: new BigNumber(1),
        toAmount: new BigNumber(1),
        expiration: new Date('2023-01-12T15:58:27.930Z'),
        status: LIMIT_ORDER_STATUS.VALID
    },
    {
        hash: '0x87aa138bb4e6d78d6efc01ee8a03d66fd127c50d48163ad2b4fe8c46bd9bde58',
        creation: new Date('2023-01-17T15:58:27.930Z'),
        fromToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].USDC,
        toToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].USDT,
        fromAmount: new BigNumber(1),
        toAmount: new BigNumber(1),
        expiration: new Date('2023-01-24T15:58:27.930Z'),
        status: LIMIT_ORDER_STATUS.VALID
    },
    {
        hash: '0x9e0b2ea33074942ce788a26a5045bcdbdeb33d04fc28181fef6b3d55499a66c0',
        creation: new Date('2023-01-13T10:44:42.329Z'),
        fromToken: TOKENS[BLOCKCHAIN_NAME.ETHEREUM].ETH,
        toToken: TOKENS[BLOCKCHAIN_NAME.ETHEREUM].USDT,
        fromAmount: new BigNumber(1),
        toAmount: new BigNumber(1),
        expiration: new Date('2023-01-24T15:58:27.930Z'),
        status: LIMIT_ORDER_STATUS.VALID
    },
    {
        hash: '0x9f5885b2a9aab432c861c90468fa0917aafa60373e9b94c3bf0927b190117b3d',
        creation: new Date('2022-01-17T15:58:27.930Z'),
        fromToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].USDC,
        toToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].WMATIC,
        fromAmount: new BigNumber(1),
        toAmount: new BigNumber(1),
        expiration: new Date('2022-01-24T15:58:27.930Z'),
        status: LIMIT_ORDER_STATUS.VALID
    }
];
