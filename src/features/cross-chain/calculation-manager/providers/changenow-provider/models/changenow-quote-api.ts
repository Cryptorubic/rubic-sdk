export interface ChangenowQuoteRequestParams {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
    fromNetwork: string;
    toNetwork: string;
}

export interface ChangenowQuoteResponse {
    toAmount: number;
    fromCurrency: string;
    toCurrency: string;
    fromNetwork: string;
    toNetwork: string;
    flow: 'standard' | 'fixed-rate';
    type: 'direct' | 'reverse';
    userId: number;
    depositFee: number;
    withdrawalFee: number;
    validUntil: string | null;
    rateId: string | null;
    transactionSpeedForecast: string | null;
    warningMessage: string | null;
}
