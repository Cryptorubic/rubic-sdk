import BigNumber from 'bignumber.js';
export interface GasData {
    readonly gasLimit: BigNumber;
    readonly gasPrice: BigNumber;
}
