export const LIMIT_ORDER_STATUS = {
    VALID: 'valid',
    FILLED: 'filled',
    EXPIRED: 'expired'
} as const;

export type LimitOrderStatus = (typeof LIMIT_ORDER_STATUS)[keyof typeof LIMIT_ORDER_STATUS];
