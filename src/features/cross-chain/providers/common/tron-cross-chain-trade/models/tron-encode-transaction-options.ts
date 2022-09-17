import { BasicEncodeTransactionOptions } from 'src/features/cross-chain/providers/common/models/basic-encode-transaction-options';

export interface TronEncodeTransactionOptions extends BasicEncodeTransactionOptions {
    feeLimit?: number;
}
