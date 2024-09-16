export interface StonfiQuoteResponse {
    /**
     * fromToken address
     */
    offer_address: string;
    /**
     * toToken address
     */
    ask_address: string;
    offer_jetton_wallet: string;
    ask_jetton_wallet: string;
    router_address: string;
    pool_address: string;
    /**
     * toAmount
     */
    ask_units: string;
    /**
     * toAmountMin
     */
    min_ask_units: string;
    price_impact: string;
    fee_units: string;
    fee_percent: string;
}

export interface StonfiQuoteInfo {
    outputAmountWei: string;
    minOutputAmountWei: string;
    stonfiFee: string;
}

export interface StonfiSwapInfo {
    to: string;
    value: string;
    body: string;
}
