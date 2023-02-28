export enum ChangenowApiStatus {
    NEW = 'new',
    WAITING = 'waiting',
    CONFIRMING = 'confirming',
    EXCHANGING = 'exchanging',
    SENDING = 'sending',
    FINISHED = 'finished',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    VERIFYING = 'verifying'
}

export interface ChangenowApiResponse {
    status: ChangenowApiStatus;
    payoutHash: string | null;
}
