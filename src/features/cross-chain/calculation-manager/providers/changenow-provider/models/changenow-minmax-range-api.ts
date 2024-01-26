export interface ChangenowMinMapRangeRequestParams {
    fromCurrency: string;
    toCurrency: string;
    fromNetwork: string;
    toNetwork: string;
}

export interface ChangenowMinMaxRangeResponse {
    minAmount: string;
    maxAmount: string | null;
}
