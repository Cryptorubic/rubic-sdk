export enum ChaingeTransactionStatus {
    SUCCESSFULL = 'succesfull',
    PENDING = 'pending',
    FAILED = 'failed'
}

export interface ChaingeStatusApiResponse {
    status: ChaingeTransactionStatus;
}
