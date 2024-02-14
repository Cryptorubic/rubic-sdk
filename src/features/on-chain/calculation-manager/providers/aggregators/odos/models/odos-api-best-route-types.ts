import { Any } from 'src/common/utils/types';

export interface OdosBestRouteRequestBody {
    chainId: number;
    inputTokens: OdosInputTokenRequest[];
    outputTokens: OdosOutputTokenRequest[];
    userAddr: string;
    slippageLimitPercent: number;
    /* to exclude/include swappers need to find name in odos-api - check /info/liquidity-sources/{chain_id} endpoint */
    sourceBlacklist: string[];
    sourceWhitelist: string[];
    /* simple: true used to make response faster */
    simple?: boolean;
    /* Use Odos V2 compact call data for transaction, defaults to */
    compact?: boolean;
    /* If input and output tokens are the same, only route through like assets for decreased slippage. */
    likeAsset?: boolean;
    /* Disable all exchanges that qualify as RFQs with centralized API */
    disableRFQs?: boolean;
    /* Receiving partner specific benefits */
    referralCode?: number;
}

export interface OdosInputTokenRequest {
    tokenAddress: string;
    amount: string;
}

export interface OdosOutputTokenRequest {
    tokenAddress: string;
    proportion: number;
}

export interface OdosBestRouteResponse {
    pathId: string;
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
