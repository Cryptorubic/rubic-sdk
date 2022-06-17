export interface EncodeTransactionOptions {
    /**
     * User wallet address to send swap transaction.
     */
    fromAddress: string;

    /**
     * Transaction gas price.
     */
    gasPrice?: string;

    /**
     * Transaction gas limit.
     */
    gasLimit?: string;
}
