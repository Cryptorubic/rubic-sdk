import { BasicEncodeTransactionOptions } from 'src/features/common/models/basic-encode-transaction-options';

export interface TronEncodeTransactionOptions extends BasicEncodeTransactionOptions {
    feeLimit?: number;
}
