import { OkuSwapBlockchainName } from './okuswap-chain-names';

export interface OkuSubProvidersRes {
    status: OkuSubProviderInfo[];
}

export interface OkuSubProviderInfo {
    name: string;
    active: boolean;
    report?: {
        chains: string[];
    };
}

export interface OkuQuoteRequestBody {
    chain: OkuSwapBlockchainName;
    account: string;
    isExactIn: boolean;
    inTokenAddress: string;
    outTokenAddress: string;
    /* non-wei raw amount (100, 100.1 etc) */
    inTokenAmount: string;
    slippage: number;
}

export interface OkuQuoteResponse {
    /* non-wei raw amount (100, 100.1 etc) */
    outAmount: string;
    coupon: object;
    signingRequest?: {
        typedData: object[];
        permit2Address: string;
        permitSignature: object[];
    };
    estimatedGas: string;

    chainId: number;
    isExactIn: boolean;
    market: string;
    inToken: object;
    outToken: object;
    inAmount: string;
    humanPrice: number;
    candidateTrade: object;
    analysis: object;
    slippage: number;
    path: object[];
    extra: string;
    inUsdValue: number;
    outUsdValue: number;
}

export interface OkuSwapRequestBody {
    coupon: object;
    signingRequest?: {
        typedData: object[];
        permit2Address: string;
        permitSignature: object[];
    };
}

export interface OkuSwapResponse {
    trade: {
        to: string;
        data: string;
        value: string;
        chainId: number;
        accessList: string;
    };
    extra: string;
    transactions: object[];
    approvals: object[];
}

export interface GetBestRouteReturnType {
    subProvider: string;
    swapReqBody: OkuSwapRequestBody;
    toAmount: string;
    gas: string;
}
