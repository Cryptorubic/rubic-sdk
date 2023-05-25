import BigNumber from 'bignumber.js';

export type GasPrice = EIP1559Gas & SingleGasPrice;
export interface EIP1559Gas {
    /**
     * EIP-1559 Block base fee.
     */
    baseFee?: string;

    /**
     * EIP-1559 Transaction maximum fee.
     */
    maxFeePerGas?: string;

    /**
     * EIP-1559 Transaction miner's tip.
     */
    maxPriorityFeePerGas?: string;
}
export interface SingleGasPrice {
    gasPrice?: string;
}

export type GasPriceBN = {
    [P in keyof GasPrice]: BigNumber;
};
