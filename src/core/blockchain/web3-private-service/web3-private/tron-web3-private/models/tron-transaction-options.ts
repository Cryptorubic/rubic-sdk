export interface TronTransactionOptions {
    /**
     * Callback to be called, when user confirm swap transaction.
     * @param hash Transaction hash.
     */
    onTransactionHash?: (hash: string) => void;

    feeLimit?: number;
    callValue?: number;
}
