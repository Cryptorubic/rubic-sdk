import { Any } from 'src/common/utils/types';

import { OnChainTradeType } from '../../common/models/on-chain-trade-type';

export interface OdosBestRouteRequestParams {
    chainId: number;
    inputTokens: OdosInputTokenRequest[];
    outputTokens: OdosOutputTokenRequest[];
    userAddr: string;
    slippageLimitPercent: number;
    sourceBlacklist: OnChainTradeType[];
    sourceWhitelist: OnChainTradeType[];
}

interface OdosInputTokenRequest {
    tokenAddress: string;
    amount: number;
}

interface OdosOutputTokenRequest {
    tokenAddress: string;
    proportion: number;
}

export interface OdosBestRouteResponse {
    pathId: string | null;
    inTokens: string[];
    outTokens: string[];
    /**
     * inAmounts/outAmounts - wei-amount (string)
     */
    inAmounts: string[];
    outAmounts: string[];
    /**
     * inValues/outValues - float number with comma between integer and decimals
     */
    inValues: number[];
    outValues: number[];

    netOutValue: number;
    priceImpact: number | null;
    percentDiff: number;
    partnerFeePercent: number;
    gasEstimate: number;
    gasEstimateValue: number;
    dataGasEstimate: string;
    gweiPerGas: number;
    deprecated: string | null;
    blockNumber: number;
    pathViz: Record<string, Any>;
    pathVizImage: string | null;
}
