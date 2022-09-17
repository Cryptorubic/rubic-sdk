export interface BridgersQuoteResponse {
    txData: {
        toTokenAmount: number;
        amountOutMin: string;
        fee: number;
        feeToken: string;
        chainFee: string;
        depositMin: string;
        depositMax: string;
    };
}
