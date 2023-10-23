export interface OneinchSwapRequest {
    params: {
        src: string;
        dst: string;
        amount: string;
        from: string;
        slippage: string;
        protocols?: string;
        fee?: string;
        connectorTokens?: string;
        permit?: string;
        receiver?: string;
        referrer?: string;
        disableEstimate: boolean;
        compatibility?: boolean;
        burnChi?: boolean;
    };
}
