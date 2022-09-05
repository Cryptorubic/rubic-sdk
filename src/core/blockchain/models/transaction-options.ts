import BigNumber from 'bignumber.js';
import { BasicTransactionOptions } from 'src/core';

export type TransactionOptions = BasicTransactionOptions & {
    /**
     * Encoded data, which will be executed in transaction.
     */
    data?: string;

    /**
     * Native token amount in wei.
     */
    value?: BigNumber | string;
};
