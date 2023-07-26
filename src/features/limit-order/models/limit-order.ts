import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';
import { LimitOrderStatus } from 'src/features/limit-order/models/limit-order-status';

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
    fromBalance: BigNumber;

    status: LimitOrderStatus;
    /**
     * From 0 to 100, stores filled percent of order.
     */
    filledPercent: number;
}
