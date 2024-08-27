export interface ZetaChainForeignCoinsRes {
    foreignCoins: ZetaChainForeignCoinInfo[];
}

interface ZetaChainForeignCoinInfo {
    zrc20_contract_address: string;
    liquidity_cap: string;
}

export interface QuoteRequest {
    fromAmount: string;
    fromChainId: number;
    fromToken: string;
    toChainId: number;
    toToken: string;
}

export interface QuoteResponse {
    destChainGasFees: string;
    outputAmount: string;
    srcChainGasFees: string;
}
