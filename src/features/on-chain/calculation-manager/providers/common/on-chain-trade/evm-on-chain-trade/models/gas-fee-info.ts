import BigNumber from 'bignumber.js';

/**
 * Stores gas fee information in calculated trade (in wei).
 */
export interface GasFeeInfo {
    readonly totalGas?: BigNumber;
    readonly gasLimit?: BigNumber;
    readonly gasPrice?: BigNumber;
    readonly gasFeeInEth?: BigNumber;
    readonly gasFeeInUsd?: BigNumber;
    readonly maxFeePerGas?: BigNumber;
}
