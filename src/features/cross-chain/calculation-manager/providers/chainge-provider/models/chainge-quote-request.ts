export interface ChaingeQuoteRequest {
    fromAmount: number;
    fromChain: string;
    fromToken: string;
    toChain: string;
    toToken: string;
    feeLevel: number;
}
