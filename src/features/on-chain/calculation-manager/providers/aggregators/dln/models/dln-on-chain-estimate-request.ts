export interface DlnOnChainEstimateRequest {
    chainId: number;
    tokenIn: string;
    tokenInAmount: string;
    slippage?: number;
    tokenOut: string;
    affiliateFeePercent?: number;
    affiliateFeeRecipient?: string;
}
