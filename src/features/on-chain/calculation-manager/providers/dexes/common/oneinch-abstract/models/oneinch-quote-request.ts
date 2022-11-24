export interface OneinchQuoteRequest {
    params: {
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        connectorTokens?: string;
    };
}
