import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';
import { LIMIT_ORDER_STATUS } from 'src/features/limit-order/models/limit-order-status';

/**
 * Parsed limit order, returned from 1inch api.
 */
export interface LimitOrder {
    hash: string;

    creation: Date;
    expiration: Date | null;

    fromToken: Token | null;
    toToken: Token | null;
    fromAmount: BigNumber;
    toAmount: BigNumber;

    status: LIMIT_ORDER_STATUS;
    /**
     * From 0 to 100, stores filled percent of order.
     */
    filledPercent: number;
}
