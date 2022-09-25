import { BasicSwapTransactionOptions } from 'src/features/common/models/basic-swap-transaction-options';

export interface EvmSwapTransactionOptions extends BasicSwapTransactionOptions {
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
