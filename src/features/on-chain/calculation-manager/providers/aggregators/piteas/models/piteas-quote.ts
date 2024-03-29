export interface PiteasQuoteRequestParams {
    tokenInAddress: string;
    tokenInChainId: number;
    tokenOutAddress: string;
    tokenOutChainId: number;
    amount: string; // Amount with decimals
    allowedSlippage: number;
    account?: string; // Receiver address
}

export interface PiteasSuccessQuoteResponse {
    destAmount: string;
    gasUseEstimate: number;
    methodParameters: PiteasMethodParameters;
}

export interface PiteasMethodParameters {
    calldata: string;
    value: string;
}
