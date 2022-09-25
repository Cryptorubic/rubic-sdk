import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';

export interface TronSwapTransactionOptions extends SwapTransactionOptions {
    feeLimit?: number;

    approveFeeLimit?: number;
}
