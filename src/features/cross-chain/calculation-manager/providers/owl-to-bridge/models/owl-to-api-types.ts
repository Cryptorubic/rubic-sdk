export interface OwlToAllChainsResponse {
    code: number;
    msg: OwlToChainInfo[];
}

interface OwlToChainInfo {
    name: string;
    chainId: number;
    isTestnet: number;
    networkCode: number;
    aliasName: string;
    text: string;
    icon: string;
    explorerUrl: string;
    baseChainId: number;
    order: number;
}

export interface OwlToTokensResponse {
    code: number;
    msg: OwlToTokenInfo[];
}

interface OwlToTokenInfo {
    symbol: string;
    decimal: number;
    fromChainId: number;
    fromAddress: string;
    toChainId: number;
    toAddress: string;
    minValue: number;
    maxValue: number;
}
