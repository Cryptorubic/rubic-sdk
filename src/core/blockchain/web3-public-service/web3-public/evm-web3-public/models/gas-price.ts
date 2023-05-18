export type GasPrice = EIP1559Gas & SingleGasPrice;
export interface EIP1559Gas {
    baseFee?: number | string | null;
    maxFeePerGas?: number | string | null;
    maxPriorityFeePerGas?: number | string | null;
}
export interface SingleGasPrice {
    gasPrice?: number | string | null;
}
