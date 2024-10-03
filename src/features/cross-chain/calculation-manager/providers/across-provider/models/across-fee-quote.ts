export interface AcrossFeeQuoteRequestParams {
    inputToken: string;
    outputToken: string;
    originChainId: number;
    destinationChainId: number;
    amount: string;
    skipAmountLimit: boolean;
    recipient?: string;
    depositMethod?: string;
}

export interface AcrossFeeQuoteResponse {
    totalRelayFee: AcrossFee;
    relayerCapitalFee: AcrossFee;
    relayerGasFee: AcrossFee;
    lpFee: AcrossFee;
    timestamp: string;
    isAmountTooLow: boolean;
    quoteBlock: string;
    spokePoolAddress: string;
    exclusiveRelayer: string;
    exclusivityDeadline: string;
    expectedFillTimeSec: string;
    limits: AcrossAmountLimits;
}

export interface AcrossAmountLimits {
    minDeposit: string;
    maxDeposit: string;
    maxDepositInstant: string;
    maxDepositShortDelay: string;
    recommendedDepositInstant: string;
}

interface AcrossFee {
    pct: string;
    total: string;
}
