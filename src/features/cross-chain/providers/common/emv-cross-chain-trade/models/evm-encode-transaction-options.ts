import { BasicEncodeTransactionOptions } from 'src/features/cross-chain/providers/common/models/basic-encode-transaction-options';

export interface EvmEncodeTransactionOptions extends BasicEncodeTransactionOptions {
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
