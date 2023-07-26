export const CHANGENOW_API_STATUS = {
    NEW: 'new',
    WAITING: 'waiting',
    CONFIRMING: 'confirming',
    EXCHANGING: 'exchanging',
    SENDING: 'sending',
    FINISHED: 'finished',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    VERIFYING: 'verifying'
} as const;

export type ChangenowApiStatus = (typeof CHANGENOW_API_STATUS)[keyof typeof CHANGENOW_API_STATUS];

export interface ChangenowApiResponse {
    status: ChangenowApiStatus;
    payoutHash: string | null;
}
