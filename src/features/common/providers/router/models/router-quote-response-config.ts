

type RouterFlowType = 'trustless' | 'mint-burn' | 'circle' | 'gateway' | 'none';

interface RouterAsset {
    decimals: number;
    symbol: string;
    name: string;
    chainId: string;
    address: string;
    resourceID: string;
    isMintable: boolean;
    isWrappedAsset: boolean;
}

interface RouterSwapTokenInfo {
    chainId: string;
    asset: RouterAsset;
    stableReserveAsset: RouterAsset;
    tokenAmount: string;
    stableReserveAmount: string;
    path: unknown[];
    flags: unknown[];
    priceImpact: string;
    tokenPath: string;
    dataTx: unknown[]
}

export interface RouterQuoteResponseConfig {
    flowType: RouterFlowType;
    isTransfer: boolean;
    isWrappedToken: boolean;
    allowanceTo: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    source: RouterSwapTokenInfo & {
        bridgeFeeAmount: string
    };
    destination: RouterSwapTokenInfo;
    partnerId: number;
    estimatedTime: number;
    slippageTolerance: number;
}
