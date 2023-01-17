import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';
import { LIMIT_ORDER_STATUS } from 'src/features/limit-order/models/limit-order-status';

export interface LimitOrder {
    creation: Date;
    fromToken: Token | null;
    toToken: Token | null;
    fromAmount: BigNumber;
    toAmount: BigNumber;
    expiration: Date | null;
    status: LIMIT_ORDER_STATUS;
}
