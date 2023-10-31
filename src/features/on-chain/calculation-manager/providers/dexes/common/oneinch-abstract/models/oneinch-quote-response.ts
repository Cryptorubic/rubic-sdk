export interface OneinchQuoteResponse {
    fromToken: object;
    toToken: object;
    toAmount: string;
    fromTokenAmount: string;
    protocols: [{ fromTokenAddress: string; toTokenAddress: string }[][]];
    gas: string;
}
