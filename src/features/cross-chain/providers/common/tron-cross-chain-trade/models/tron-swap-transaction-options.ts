import { BasicSwapTransactionOptions } from 'src/features/cross-chain/providers/common/models/basic-swap-transaction-options';

export interface TronSwapTransactionOptions extends BasicSwapTransactionOptions {
    receiverAddress: string;

    feeLimit: number;

    approveFeeLimit: number;
}
