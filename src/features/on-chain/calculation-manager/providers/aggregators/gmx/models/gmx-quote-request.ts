export interface GMXQuoteRequest {
    amount: string;
    inTokenAddress: string;
    outTokenAddress: string;
    gasPrice: string;
    [key: string]: string | number;
}

export type GMXSwapQuoteRequest = GMXQuoteRequest & {
    slippage: number;
    account: string;
    referrer: string;
};
