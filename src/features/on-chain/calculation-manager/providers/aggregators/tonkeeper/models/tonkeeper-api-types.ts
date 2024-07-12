export type TonkeeperResp<T> = T | string;

export interface TonkeeperQuoteResp {
    provider: TonkeeperDexType;
    trades: [TonkeeperDedustQuoteInfo | TonkeeperStonfiQuoteInfo];
}

export type TonkeeperDexType = 'stonfi' | 'dedust';

export interface TonkeeperDedustQuoteInfo extends TonkeeperCommonQuoteInfo {
    dedustRawTrade: TonkeeperRawTradeStep | TonkeeperRawTradeStep[];
}

export interface TonkeeperStonfiQuoteInfo extends TonkeeperCommonQuoteInfo {
    stonfiRawTrade: TonkeeperRawTradeStep | TonkeeperRawTradeStep[];
}

interface TonkeeperCommonQuoteInfo {
    fromAsset: string;
    toAsset: string;
    fromAmount: string;
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
