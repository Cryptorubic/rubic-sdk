/**
 * Stores options for transaction in `swap` function.
 */
export interface SwapTransactionOptions {
    /**
     * Callback to be called, when user confirm swap transaction.
     * @param hash Transaction hash.
     */
    onConfirm?: (hash: string) => void;

    /**
     * Callback to be called, when user confirm approve transaction.
     * @param hash Transaction hash.
     */
    onApprove?: (hash: string | null) => void;

    /**
     * Transaction gas price.
     */
    gasPrice?: string;

    /**
     * Swap transaction gas limit.
     */
    gasLimit?: string;

    /**
     * Approve transaction gas limit.
     * Will be used for approve transaction, if it is called before swap.
     */
    approveGasLimit?: string;
}
