import BigNumber from 'bignumber.js';

export interface GasInfo {
    readonly gasLimit?: string;
    readonly gasPrice?: string;
    readonly gasFeeInUsd?: BigNumber;
    readonly gasFeeInEth?: BigNumber;
}
