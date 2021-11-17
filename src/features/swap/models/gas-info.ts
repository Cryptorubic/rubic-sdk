import BigNumber from 'bignumber.js';

export interface GasInfo {
    gasLimit: string | null;
    gasPrice: string | null;
    gasFeeInUsd: BigNumber | null;
    gasFeeInEth: BigNumber | null;
}
