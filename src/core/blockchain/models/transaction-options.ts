import BigNumber from 'bignumber.js';

export type TransactionOptions = {
    /**
     * Callback to execute when transaction enters the mempool.
     * @param hash Transaction hash.
     */
    onTransactionHash?: (hash: string) => void;

    /**
     * Encoded data, which will be executed in transaction.
     */
    data?: string;

    /**
     * Gas limit.
     */
    gas?: BigNumber | string;

    gasPrice?: BigNumber | string;

    /**
     * Native token amount in wei.
     */
    value?: BigNumber | string;
};
