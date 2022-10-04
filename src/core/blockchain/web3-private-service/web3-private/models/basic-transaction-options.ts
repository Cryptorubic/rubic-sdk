export interface BasicTransactionOptions {
    /**
     * Callback to be called, when user confirm swap transaction.
     * @param hash Transaction hash.
     */
    onTransactionHash?: (hash: string) => void;
}
