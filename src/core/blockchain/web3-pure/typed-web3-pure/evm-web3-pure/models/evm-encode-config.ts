export interface EvmEncodeConfig {
    to: string;
    data: string;
    value: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
}
