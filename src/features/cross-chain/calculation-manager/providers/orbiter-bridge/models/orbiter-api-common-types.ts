export interface OrbiterResponse<T> {
    message: string;
    params: {
        method: string;
        routes: object;
        url: string;
    };
    status: string;
    result: T;
}

export const ORBITER_STATUS = {
    ERROR: 3,
    SUCCESS: 2
} as const;

export type OrbiterTxStatus = (typeof ORBITER_STATUS)[keyof typeof ORBITER_STATUS];

export const ORBITER_OP_STATUS = {
    SOURCE_CHAIN_OR_TOKEN_NOT_FOUND: 2,
    TARGET_CHAIN_OR_TOKEN_NOT_FOUND: 3,
    RULE_NOT_FOUND: 4,
    NONCE_EXCEED_MAXIMUM: 5,
    AMOUNT_TOO_SMALL: 6,
    REFUND: 80,
    MONEY_WILL_REFUND: 96,
    ABNORMAL_PAYMENT: 97,
    MONEY_REFUNDED: 98,
    SUCCESS_PAYMENT: 99
};

export type OrbiterOpTxStatus = (typeof ORBITER_OP_STATUS)[keyof typeof ORBITER_OP_STATUS];
