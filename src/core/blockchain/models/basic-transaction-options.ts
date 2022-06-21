export type BasicTransactionOptions = {
    /**
     * Callback to be called, when user confirm swap transaction.
     * @param hash Transaction hash.
     */
    onTransactionHash?: (hash: string) => void;

    /**
     * Transaction gas limit.
     */
    gasLimit?: string;

    /**
     * Transaction gas price.
     */
    gasPrice?: string;
};
