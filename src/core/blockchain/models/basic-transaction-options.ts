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
    gas?: BigNumber | string | number;

    /**
     * Transaction gas price.
     */
    gasPrice?: BigNumber | string | number;
};
