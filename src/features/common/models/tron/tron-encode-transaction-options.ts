import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

export interface TronEncodeTransactionOptions extends EncodeTransactionOptions {
    feeLimit?: number;
}
