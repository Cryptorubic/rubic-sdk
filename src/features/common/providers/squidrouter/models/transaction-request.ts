/**
 * Transaction request params.
 */
export interface SquidrouterTransactionRequest {
    readonly fromChain: number;
    readonly fromToken: string;
    readonly fromAmount: string;
    readonly toChain: number;
    readonly toToken: string;
    readonly toAddress: string;
    readonly slippage: number;
    readonly enableForecall?: true;
}
