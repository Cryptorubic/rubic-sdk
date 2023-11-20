export const RANGO_SWAP_STATUS = {
    SUCCESS: 'success',
    FAILED: 'failed',
    RUNNING: 'runnig'
} as const;

export type RangoSwapStatus = (typeof RANGO_SWAP_STATUS)[keyof typeof RANGO_SWAP_STATUS];
