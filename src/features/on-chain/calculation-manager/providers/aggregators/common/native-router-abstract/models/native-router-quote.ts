import { NativeRouterTransactionRequest } from './native-router-transaction-request';

export interface NativeRouterQuoteRequestParams {
    chain: string;
    tokenIn: string;
    tokenOut: string;
    amount: string;
    fromAddress: string;
    slippage?: number;
}

export interface NativeRouterQuoteResponse {
    amountOut: string;
    txRequest: NativeRouterTransactionRequest;
}
