interface OwlToBaseResponse<T> {
    code: number;
    msg: T;
}

export type OwlToAllChainsResponse = OwlToBaseResponse<OwlToChainInfo[]>;

export interface OwlToSwappingChainsInfo {
    sourceChain: OwlToChainInfo;
    targetChain: OwlToChainInfo;
}

export interface OwlToChainInfo {
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

export type OwlToTokensResponse = OwlToBaseResponse<OwlToTokenInfo[]>;

export interface OwlToTokenInfo {
    symbol: string;
    decimal: number;
    fromChainId: number;
    fromAddress: string;
    toChainId: number;
    toAddress: string;
    minValue: number;
    maxValue: number;
}

export interface OwlToTransferFeeParams {
    sourceChainName: string;
    targetChainName: string;
    fromAmount: number;
    tokenSymbol: string;
}

export type OwlToTransferFeeResponse = OwlToBaseResponse<string>;

export interface OwlToTxInfoParams {
    tokenSymbol: string;
    sourceChainId: number;
    targetChainId: number;
    walletAddress: string;
}

export type OwlToTxInfoResponse = OwlToBaseResponse<{
    maker_address: string;
    estimated_gas: string;
}>;

export type OwlToStatusResponse = OwlToBaseResponse<{
    is_verified: boolean;
    dst_chainid: number;
    dst_tx_hash: string;
}>;
