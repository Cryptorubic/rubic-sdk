export interface BridgersSwapRequest {
    fromTokenAddress: string;
    toTokenAddress: string;
    fromAddress: string;
    toAddress: string;
    fromTokenChain: string;
    toTokenChain: string;
    fromTokenAmount: string;
    amountOutMin: string;
    equipmentNo: string;

    /**
     * Use `rubic` if swap is sent through rubic-proxy contract.
     * Use `rubic_widget` if swap is sent directly through bridgers contract.
     */
    sourceFlag: 'rubic' | 'rubic_widget';
}
