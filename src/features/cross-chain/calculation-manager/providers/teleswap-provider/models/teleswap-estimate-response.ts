export interface TeleSwapEstimateResponse {
    minInputAmountBTC: string;
    inputAmountBTC: string | number;
    /* wei (8500000) */
    outputAmount: string;
    teleswapFee: {
        networkFeeBTC: string;
        protocolFeeBTC: string;
        lockerFeeBTC: string;
        thirdPartyFeeBTC: string;
        totalFeeBTC: string;
    };
    internalExchange: {
        path: string;
        inputAmount: string;
        outputAmount: string;
    };
}

export interface TeleSwapEstimateNativeResponse {
    minInputAmountBTC: string;
    inputAmountBTC: string | number;
    /* non wei (0.000085) */
    outputAmountBTC: string;
    teleswapFee: {
        networkFeeBTC: string;
        protocolFeeBTC: string;
        lockerFeeBTC: string;
        thirdPartyFeeBTC: string;
        totalFeeBTC: string;
    };
}
