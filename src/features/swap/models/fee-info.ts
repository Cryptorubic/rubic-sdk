import BigNumber from 'bignumber.js';

export interface FeeInfo {
    readonly gasLimit?: string;
    readonly gasPrice?: string;
    readonly gasFeeInUsd?: BigNumber;
    readonly gasFeeInEth?: BigNumber;
}
