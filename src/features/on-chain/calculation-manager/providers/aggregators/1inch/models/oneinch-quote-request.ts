export interface OneinchQuoteRequest {
    params: {
        src: string;
        dst: string;
        amount: string;
        connectorTokens?: string;
    };
}
