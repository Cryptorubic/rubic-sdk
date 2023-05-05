export interface MultichainTargetToken {
    address: string;
    tokenType: 'NATIVE' | 'TOKEN';
    symbol: string;

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
    symbol: string;
    tokenType: 'NATIVE' | 'TOKEN';
    price: number;
    destChains: {
        [dstChainId: string]: {
            [hash: string]: MultichainTargetToken;
        };
    };
    address: string;
}

export interface MultichainTokensResponse {
    [address: string]: MultichainSourceToken;
}
