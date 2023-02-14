export interface ChangenowEstimatedAmountResponse {
    toAmount: string;
}
export interface ChangenowRangeResponse {
    minAmount: string;
    maxAmount: string | null;
}

export interface ChangenowExchangeResponse {
    id: string;
    payinAddress: string;
    payinExtraId: string;
    payinExtraIdName: string;
}
