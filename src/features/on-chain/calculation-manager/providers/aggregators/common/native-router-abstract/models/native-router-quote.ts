import { NativeRouterTransactionRequest } from './native-router-transaction-request';

export interface NativeRouterQuoteRequestParams {
    srcChain: string;
    tokenIn: string;
    tokenOut: string;
    dstChain: string;
    amount: string;
    fromAddress: string;
    slippage?: number;
}

export interface NativeRouterQuoteResponse {
    amountOut: string;
    txRequest: NativeRouterTransactionRequest;
}
