export interface RangoSwapQueryParams {
    apiKey: string;
    from: string;
    to: string;
    amount: string;
    slippage: number;
    fromAddress: string;
    toAddress: string;
    /**
     * List of all accepted swappers (e.g. providers), an empty list means no filter is required
     */
    swapperGroups?: string;
    /**
     * Indicates include/exclude mode for the swappers param
     */
    swappersGroupsExclude?: boolean;
}

export interface RangoBestRouteQueryParams {
    apiKey: string;
    from: string;
    to: string;
    amount: string;
    slippage?: number;
    swapperGroups?: string;
    swappersGroupsExclude?: boolean;
}

/**
 * @property {string} apiKey
 * @property {string} requestId Random UUID returned in swap/quote methodes in response
 * @property {string} srcTxHash In Rango-api used as `txId` queryParam in getTxStatus request
 */
export interface RangoTxStatusQueryParams {
    apiKey: string;
    requestId: string;
    txId: string;
}
