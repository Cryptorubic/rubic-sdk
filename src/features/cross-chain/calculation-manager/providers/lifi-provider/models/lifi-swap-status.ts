export const LIFI_SWAP_STATUS = {
    NOT_FOUND: 'NOT_FOUND',
    INVALID: 'INVALID',
    PENDING: 'PENDING',
    DONE: 'DONE',
    FAILED: 'FAILED'
} as const;

export type LifiSwapStatus = (typeof LIFI_SWAP_STATUS)[keyof typeof LIFI_SWAP_STATUS];
