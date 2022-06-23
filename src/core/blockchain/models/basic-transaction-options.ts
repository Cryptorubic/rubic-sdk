import BigNumber from 'bignumber.js';

export type BasicTransactionOptions = {
    /**
     * Callback to be called, when user confirm swap transaction.
     * @param hash Transaction hash.
     */
    onTransactionHash?: (hash: string) => void;

    /**
     * Transaction gas limit.
     */
    gasLimit?: BigNumber | string;

    /**
     * Transaction gas price.
     */
    gasPrice?: BigNumber | string;
};
