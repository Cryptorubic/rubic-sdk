export interface BridgersQuoteRequest {
    fromTokenAddress: string;
    toTokenAddress: string;
    fromTokenAmount: string;
    fromTokenChain: string;
    toTokenChain: string;
    sourceFlag: 'rubic';
}

export interface BridgersQuoteResponse {
    resMsg: string;
    resCode: number;
    data: {
        txData: {
            toTokenAmount: number;
            amountOutMin: string;
            fee: number;
            chainFee: string;
            depositMin: string;
            depositMax: string;
            contractAddress: string;
            /* ex.: "0.50000" */
            serviceFee: string;
            /* number of dst tokens you'll got after swapping 1 src token  */
            instantRate: string;
        };
    };
}
