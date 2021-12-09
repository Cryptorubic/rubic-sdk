import BigNumber from 'bignumber.js';

export interface GasPriceInfo {
    readonly gasPrice: BigNumber;
    readonly gasPriceInUsd: BigNumber;
    readonly gasPriceInEth: BigNumber;
}
