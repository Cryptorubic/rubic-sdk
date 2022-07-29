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

/**
 * Estimation object.
 */
export interface Estimation {
    /**
     * Source chain token in.
     */
    readonly srcChainTokenIn: TokenAmount;

    /**
     * Destination chain token in.
     */
    readonly dstChainTokenIn: TokenMinAmount;

    /**
     * Destination chain token out.
     */
    readonly dstChainTokenOut: TokenMinAmount;

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
