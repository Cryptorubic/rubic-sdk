export interface OneinchQuoteResponse {
    fromToken: object;
    toToken: object;
    dstAmount: string;
    fromTokenAmount: string;
    protocols: [{ fromTokenAddress: string; toTokenAddress: string }[][]];
    gas: string;
}
