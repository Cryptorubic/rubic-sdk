export interface XyQuoteRequest {
    srcChainId: number;
    srcQuoteTokenAddress: string;
    srcQuoteTokenAmount: string;
    dstChainId: number;
    dstQuoteTokenAddress: string;
    slippage: number; // Percent
    affiliate?: string; // Affiliate address
    commissionRate?: number;
}
