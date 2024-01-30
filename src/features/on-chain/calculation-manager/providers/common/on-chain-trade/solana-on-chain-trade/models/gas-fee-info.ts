import BigNumber from 'bignumber.js';

/**
 * Stores gas fee information in calculated trade.
 */
export interface GasFeeInfo {
    readonly gasLimit?: BigNumber;
    readonly gasPrice?: BigNumber;
    readonly gasFeeInEth?: BigNumber;
    readonly gasFeeInUsd?: BigNumber;
    readonly maxFeePerGas?: BigNumber;
}
