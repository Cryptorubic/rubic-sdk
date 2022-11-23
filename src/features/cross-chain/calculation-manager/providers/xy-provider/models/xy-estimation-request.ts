/**
 * XY api request params.
 */
export interface XyEstimationRequest {
    /**
     * Source chain ID.
     */
    readonly srcChainId: string;

    /**
     * Source token in address.
     */
    readonly fromTokenAddress: string;

    /**
     * Source token in amount.
     */
    readonly amount: string;

    /**
     * Destination chain ID.
     */
    readonly destChainId: number;

    /**
     * Destination token out address.
     */
    readonly toTokenAddress: string;
}
