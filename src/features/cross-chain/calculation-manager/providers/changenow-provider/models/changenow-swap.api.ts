export interface ChangenowSwapRequestBody {
    fromCurrency: string;
    toCurrency: string;
    fromNetwork: string;
    toNetwork: string;
    fromAmount: string;
    address: string;
    flow: string;
    payload?: {
        integratorAddress: string;
    };
}

export interface ChangenowSwapResponse {
    /* used for checking tx-status */
    id: string;
    payinAddress: string;
    payoutAddress: string;
    flow: string;
    toAmount: number;
    fromAmount: number;
    type: 'direct' | 'reverse';
    payoutExtraId: string;
    payoutExtraIdName: string;
    payinExtraId: string;
    payinExtraIdName: string;
    refundAddress: string;
    refundExtraId: string;
}
