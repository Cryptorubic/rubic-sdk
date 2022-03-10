export interface EncodeTransactionOptions {
    gasPrice?: string;
    gasLimit?: string;
}

export interface EncodeFromAddressTransactionOptions extends EncodeTransactionOptions {
    fromAddress: string;
}
