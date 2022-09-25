import { BasicSwapTransactionOptions } from 'src/features/common/models/basic-swap-transaction-options';

export interface TronSwapTransactionOptions extends BasicSwapTransactionOptions {
    feeLimit?: number;

    approveFeeLimit?: number;
}
