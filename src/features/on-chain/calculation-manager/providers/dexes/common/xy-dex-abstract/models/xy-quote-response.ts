import { XyQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-quote-request';

export interface XyRoute extends XyQuoteRequest {
    srcSwapDescription: {
        provider: string;
    };
    dstQuoteTokenAmount: string;
    minReceiveAmount: string;
    affiliateFeeAmount: string;
    withholdingFeeAmount: string;
    routeType: string;
    tags: unknown[];
    contractAddress: string;
    srcQuoteTokenUsdValue: string;
    dstQuoteTokenUsdValue: string;
    transactionCounts: number;
    estimatedGas: string;
    estimatedTransferTime: number;
}

export interface XyQuoteResponse {
    success: boolean;
    routes: XyRoute[];
}
