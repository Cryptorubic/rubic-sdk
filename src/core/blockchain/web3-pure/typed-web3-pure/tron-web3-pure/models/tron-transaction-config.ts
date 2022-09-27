export interface TronTransactionConfig {
    to: string;
    data: string;
    callValue?: string;
    feeLimit?: number;
}
