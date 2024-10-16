export type TonkeeperResp<T> = T | string;

export interface TonkeeperQuoteResp<T extends TonkeeperCommonQuoteInfo> {
    provider: TonkeeperDexType;
    trades: [T];
}

export type TonkeeperDexType = 'stonfi' | 'dedust';

export interface TonkeeperDedustQuoteInfo extends TonkeeperCommonQuoteInfo {
    dedustRawTrade: TonkeeperRawTradeStep | TonkeeperRawTradeStep[];
}

export interface TonkeeperStonfiQuoteInfo extends TonkeeperCommonQuoteInfo {
    stonfiRawTrade: TonkeeperRawTradeStep | TonkeeperRawTradeStep[];
}

export interface TonkeeperCommonQuoteInfo {
    fromAsset: string;
    toAsset: string;
    /** wei amount */
    fromAmount: string;
    /** wei amount */
    toAmount: string;
    blockchainFee: string;
    path: string[];
}

export interface TonkeeperRawTradeStep {
    /** raw fromTokenAddress */
    fromAsset: string;
    /** raw toTokenAddress */
    toAsset: string;
    fromAmount: string;
    toAmount: string;
}

export interface TonkeeperEncodeSwapParamsResp {
    /** for simple transfers - it's transfered amount, for swaps - it's gasFee in wei */
    value: string;
    to: string;
    body: string;
}
