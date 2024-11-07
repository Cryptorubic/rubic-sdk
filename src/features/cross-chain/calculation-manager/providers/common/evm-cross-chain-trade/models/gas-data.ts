import BigNumber from 'bignumber.js';

export type GasData = {
    readonly gasLimit: BigNumber;
    readonly gasPrice?: BigNumber;
    readonly baseFee?: BigNumber;
    readonly maxFeePerGas?: BigNumber;
    readonly maxPriorityFeePerGas?: BigNumber;
} | null;
