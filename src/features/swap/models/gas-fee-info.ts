import BigNumber from 'bignumber.js';

export interface GasFeeInfo {
    readonly gasLimit?: string;
    readonly gasPrice?: BigNumber;
    readonly gasFeeInEth?: BigNumber;
    readonly gasFeeInUsd?: BigNumber;
}
