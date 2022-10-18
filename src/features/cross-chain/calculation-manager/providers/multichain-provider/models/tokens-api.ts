export interface MultichainTargetToken {
    fromanytoken: {
        address: string;
    };
    router: string;
    spender: string;
    routerABI: string;
    MaximumSwap: number;
    MaximumSwapFee: number;
    MinimumSwap: number;
    MinimumSwapFee: number;
    SwapFeeRatePerMillion: number;
}

export interface MultichainSourceToken {
    tokenType: 'NATIVE' | 'TOKEN';
    price: number;
    destChains: {
        [dstChainId: string]: {
            [hash: string]: MultichainTargetToken;
        };
    };
}

export interface MultichainTokensResponse {
    [address: string]: MultichainSourceToken;
}
