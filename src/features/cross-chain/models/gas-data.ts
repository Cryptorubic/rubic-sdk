import BigNumber from 'bignumber.js';

export type GasData = {
    readonly gasLimit: BigNumber;
    readonly gasPrice: BigNumber;
} | null;
