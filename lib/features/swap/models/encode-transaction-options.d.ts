export interface EncodeTransactionOptions {
    gasPrice?: string | null;
    gasLimit?: string | null;
}
export interface EncodeFromAddressTransactionOptions extends EncodeTransactionOptions {
    fromAddress: string;
}
