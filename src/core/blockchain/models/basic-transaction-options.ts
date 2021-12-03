import BigNumber from 'bignumber.js';

export type BasicTransactionOptions = {
    onTransactionHash?: (hash: string) => void;
    gas?: BigNumber | string;
    gasPrice?: BigNumber | string;
};
