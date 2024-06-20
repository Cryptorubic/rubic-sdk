export interface NativeRouterTransactionRequest {
    target: string;
    calldata: string;
    value: string;
}

export interface NativeRouterChain {
    chainId: number;
    chain: string;
    label: string;
    token: string;
    isMainnet: boolean;
}
