export interface ZrxQuoteRequest {
    params: {
        sellToken: string;
        buyToken: string;
        sellAmount: string;
        slippagePercentage: string;
        affiliateAddress?: string;
    };
}
