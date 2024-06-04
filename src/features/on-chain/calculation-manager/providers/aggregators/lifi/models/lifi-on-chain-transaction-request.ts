export interface LifiOnChainTransactionRequest {
    to: string;
    data: string;
    gasLimit?: string;
    gasPrice?: string;
    value: string;
}
