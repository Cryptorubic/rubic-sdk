import BigNumber from 'bignumber.js';
export interface GasPriceInfo {
    readonly gasPrice: BigNumber;
    readonly gasPriceInEth: BigNumber;
    readonly gasPriceInUsd: BigNumber;
}
