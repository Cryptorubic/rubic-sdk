import { LimitOrderApi } from 'src/features/limit-order/models/limit-order-api';
import { TOKENS } from '__tests__/utils/tokens';
import { LIMIT_ORDER_STATUS } from 'src/features/limit-order/models/limit-order-status';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { LimitOrder } from 'src/features/limit-order/models/limit-order';
import BigNumber from 'bignumber.js';

/**
 * Wallet address, which always has not expired limit orders in 1inch api.
 */
export const userAddress = '0x11738D36B166C4F18028fE2fa28050fdbd91c430';

/**
 * Order, which will never be expired.
 */
export const orderApi: LimitOrderApi = {
    orderHash: '0x87aa138bb4e6d78d6efc01ee8a03d66fd127c50d48163ad2b4fe8c46bd9bde58',
    createDateTime: '2023-01-17T15:58:27.930Z',
    data: {
        makerAsset: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        takerAsset: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        salt: '869234911695',
        receiver: '0x0000000000000000000000000000000000000000',
        allowedSender: '0x0000000000000000000000000000000000000000',
        makingAmount: '1000000',
        takingAmount: '10000000',
        maker: '0x11738d36b166c4f18028fe2fa28050fdbd91c430',
        interactions:
            '0xbf15fcd8000000000000000000000000a5eb255ef45dfb48b5d133d08833def69871691d000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000242cc2878d050bde8da00000000000000011738d36b166c4f18028fe2fa28050fdbd91c43000000000000000000000000000000000000000000000000000000000',
        offsets: '4421431254442149611168492388118363282642987198110904030635476664713216'
    },
    orderInvalidReason: null
};

/**
 * Parsed {@link orderApi}.
 */
export const orderParsed: LimitOrder = {
    hash: '0x87aa138bb4e6d78d6efc01ee8a03d66fd127c50d48163ad2b4fe8c46bd9bde58',
    creation: new Date('2023-01-17T15:58:27.930Z'),
    fromToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].USDC,
    toToken: TOKENS[BLOCKCHAIN_NAME.POLYGON].USDT,
    fromAmount: new BigNumber(1),
    toAmount: new BigNumber(10),
    expiration: new Date('2656-10-27T03:31:44.000Z'),
    status: LIMIT_ORDER_STATUS.VALID
};
