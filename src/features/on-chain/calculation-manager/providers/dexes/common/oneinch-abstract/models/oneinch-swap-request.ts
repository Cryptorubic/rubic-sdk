export interface OneinchSwapRequest {
    params: {
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        slippage: string;
        fromAddress: string;
        disableEstimate: boolean;
        connectorTokens?: string;
        destReceiver?: string;
        protocols?: string;
        referrerAddress?: string;
        fee?: string;
        permit?: string;
        compatibilityMode?: boolean;
        burnChi?: boolean;
    };
}
