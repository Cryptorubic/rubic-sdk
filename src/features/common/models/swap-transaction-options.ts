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
     * Tokens receiver address.
     */
    receiverAddress?: string;

    /**
     * Evm-Transaction gas price.
     */
    gasPrice?: string;

    /**
     * Evm-transaction gas limit.
     */
    gasLimit?: string;

    /**
     * Approve evm-transaction gas limit.
     * Will be used for approve transaction, if it is called before swap.
     */
    approveGasLimit?: string;

    /**
     * Tron-transaction fee limit.
     */
    feeLimit?: number;

    /**
     * Approve tron-transaction fee limit.
     * Will be used for approve transaction, if it is called before swap.
     */
    approveFeeLimit?: number;

    testMode?: boolean;
}
