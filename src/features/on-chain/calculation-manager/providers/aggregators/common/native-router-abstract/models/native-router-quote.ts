import { NativeRouterTransactionRequest } from './native-router-transaction-request';

export interface NativeRouterQuoteRequestParams {
    src_chain: string;
    dst_chain: string;
    token_in: string;
    token_out: string;
    amount: string;
    from_address: string;
    slippage?: number;
    to_address?: string;
}

export interface NativeRouterQuoteResponse {
    amountOut: string;
    txRequest: NativeRouterTransactionRequest;
}
