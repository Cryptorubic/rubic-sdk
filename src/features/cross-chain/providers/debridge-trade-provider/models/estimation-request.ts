/**
 * DeBridge api request params.
 */
export interface EstimationRequest {
    /**
     * Source chain ID.
     */
    readonly srcChainId: number;

    /**
     * Source token in address.
     */
    readonly srcChainTokenIn: string;

    /**
     * Source token in amount.
     */
    readonly srcChainTokenInAmount: string;

    /**
     * Swap slippage.
     */
    readonly slippage?: number;

    /**
     * Destination chain ID.
     */
    readonly dstChainId: number;

    /**
     * Destination token out amount.
     */
    readonly dstChainTokenOut: string;

    /**
     * Execution fee amount.
     */
    readonly executionFeeAmount?: string;

    /**
     * Token address of the execution fee.
     */
    readonly executionFeeTokenAddress?: string;

    readonly dstBaseGasAmount?: number;

    readonly affiliateFeePercent?: number;

    readonly affiliateFeeRecipient?: string;
}
