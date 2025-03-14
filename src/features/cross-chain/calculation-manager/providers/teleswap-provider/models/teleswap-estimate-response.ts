export interface TeleSwapEstimateResponse {
    minInputAmountBTC: string;
    inputAmountBTC: string | number;
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
    outputAmountBTC: string;
    teleswapFee: {
        networkFeeBTC: string;
        protocolFeeBTC: string;
        lockerFeeBTC: string;
        thirdPartyFeeBTC: string;
        totalFeeBTC: string;
    };
}
