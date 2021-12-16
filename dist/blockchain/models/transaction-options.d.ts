import BigNumber from 'bignumber.js';
export declare type TransactionOptions = {
    onTransactionHash?: (hash: string) => void;
    data?: string;
    gas?: BigNumber | string;
    gasPrice?: BigNumber | string;
    value?: BigNumber | string;
};
