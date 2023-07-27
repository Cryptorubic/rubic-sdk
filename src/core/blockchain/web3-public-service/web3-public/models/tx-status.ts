export const TX_STATUS = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    FALLBACK: 'FALLBACK',
    REVERT: 'REVERT',
    UNKNOWN: 'UNKNOWN',
    READY_TO_CLAIM: 'READY_TO_CLAIM'
} as const;

export type TxStatus = (typeof TX_STATUS)[keyof typeof TX_STATUS];
