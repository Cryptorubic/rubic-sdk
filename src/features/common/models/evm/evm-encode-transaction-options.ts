import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

export interface EvmEncodeTransactionOptions extends EncodeTransactionOptions {
    /**
     * Transaction gas price.
     */
    gasPrice?: string;

    /**
     * Transaction gas limit.
     */
    gasLimit?: string;

    /**
     * Uniquely for Uniswap v2, defines which method to use - regular or supporting fee.
     */
    supportFee?: boolean;
}
