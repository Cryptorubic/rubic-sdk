export interface ChangellyEstimateResponse {
    id: string;
    result: string;
    networkFee: string;
    from: string;
    to: string;
    max: string;
    maxFrom: string;
    maxTo: string;
    min: string;
    minFrom: string;
    minTo: string;
    amountFrom: string;
    amountTo: string;
    expiredAt: number;
}

export interface ChangellyExchangeResponse {
    id: string;
    type: 'fixed' | 'float';
    status: string;
    payTill: string;
    currencyFrom: string;
    currencyTo: string;
    payinExtraId: string | null;
    payoutExtraId: string | null;
    payoutExtraIdName: string | null;
    payinExtraIdName: string | null;
    refundAddress: string;
    amountExpectedFrom: string;
    amountExpectedTo: string;
    payinAddress: string;
    payoutAddress: string;
    createdAt: number;
    networkFee: string;
}
