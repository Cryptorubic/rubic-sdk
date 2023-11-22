interface BaseToken {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
}

interface TokenAmount extends BaseToken {
    amount: string;
}

interface TokenMinAmount extends TokenAmount {
    minAmount: string;
}

interface MaxTheoreticalAmount extends TokenMinAmount {
    maxTheoreticalAmount: string;
}

/**
 * Estimation object.
 */
export interface Estimation {
    readonly costsDetails: {
        payload: {
            feeAmount: string;
        };
        type: string;
        amountIn: string;
        amountOut: string;
        tokenIn: string;
        tokenOut: string;
        chain: string;
    }[];
    /**
     * Source chain token in.
     */
    readonly srcChainTokenIn: TokenMinAmount;

    /**
     * Source chain token out.
     */
    readonly srcChainTokenOut: TokenMinAmount;

    /**
     * Destination chain token out.
     */
    readonly dstChainTokenOut: MaxTheoreticalAmount;

    /**
     *  Details of the token representing execution fee currency, a recommended amount
     *  calculated by the planner, and an actual amount used during route construction.
     */
    readonly executionFee: {
        token: BaseToken;
        recommendedAmount: string;
        actualAmount: string;
    };
}

/**
 * Swap estimates response.
 */
export interface EstimationResponse {
    /**
     * Trade estimation object.
     */
    estimation: Estimation;
}
