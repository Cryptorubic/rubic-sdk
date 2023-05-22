import BigNumber from 'bignumber.js';

export type GasPrice = EIP1559Gas & SingleGasPrice;
export interface EIP1559Gas {
    baseFee?: string | null;
    maxFeePerGas?: string | null;
    maxPriorityFeePerGas?: string | null;
}
export interface SingleGasPrice {
    gasPrice?: string | null;
}

export type GasPriceBN = {
    [P in keyof GasPrice]: BigNumber;
};
