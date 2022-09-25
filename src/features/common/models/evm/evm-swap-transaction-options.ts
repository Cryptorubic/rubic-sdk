import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

export interface EvmSwapTransactionOptions extends SwapTransactionOptions {
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
