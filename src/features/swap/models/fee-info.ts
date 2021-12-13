import BigNumber from 'bignumber.js';

export interface FeeInfo {
    readonly gasLimit?: BigNumber;
    readonly gasPrice?: BigNumber;
    readonly gasFeeInUsd?: BigNumber;
    readonly gasFeeInEth?: BigNumber;
}
