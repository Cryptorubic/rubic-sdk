import BigNumber from 'bignumber.js';

export interface GasInfo {
    readonly gasPrice: BigNumber;
    readonly gasPriceInUsd: BigNumber;
    readonly gasPriceInEth: BigNumber;
}
