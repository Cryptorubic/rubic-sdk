export interface OneinchSwapRequest {
    params: {
        fromTokenAddress: string;
        toTokenAddress: string;
        amount: string;
        slippage: string;
        fromAddress: string;
        disableEstimate: boolean;
        mainRouteParts?: string;
        destReceiver?: string;
        protocols?: string;
        referrerAddress?: string;
        fee?: string;
        permit?: string;
        compatibilityMode?: boolean;
        burnChi?: boolean;
    };
}
