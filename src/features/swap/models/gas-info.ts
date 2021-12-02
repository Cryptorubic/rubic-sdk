import BigNumber from 'bignumber.js';

export interface GasInfo {
    readonly gasLimit: string | null;
    readonly gasPrice: string | null;
    readonly gasFeeInUsd: BigNumber | null;
    readonly gasFeeInEth: BigNumber | null;
}
