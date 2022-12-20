import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { MarkRequired } from 'ts-essentials';

export interface RevertSwapTransactionOptions extends SwapTransactionOptions {
    slippageTolerance?: number;
    deadline?: number;
}

export type RequiredRevertSwapTransactionOptions = MarkRequired<
    RevertSwapTransactionOptions,
    'slippageTolerance' | 'deadline'
>;
