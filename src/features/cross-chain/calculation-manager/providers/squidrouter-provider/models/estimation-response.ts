interface Token {
    readonly chainId: number;
    readonly address: string;
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
    readonly logoURI: string;
    readonly coingeckoId: string;
}

interface Dex {
    readonly chainName: string;
    readonly dexName: string;
    readonly swapRouter: string;
    readonly factory: string;
    readonly isStable: boolean;
}

interface RouteElement {
    readonly type: string;
    readonly dex: Dex;
    readonly path: string[];
    readonly squidCallType: number;
    readonly fromToken: Token;
    readonly toToken: Token;
    readonly fromAmount: string;
    readonly toAmount: string;
    readonly exchangeRate: string;
    readonly priceImpact: string;
    readonly dynamicSlippage: number;
}

interface FeeCost {
    readonly name: string;
    readonly description: string;
    readonly percentage: string;
    readonly token: Token;
    readonly amount: string;
    readonly amountUSD: string;
}

interface GasCost {
    readonly type: string;
    readonly token: Token;
    readonly amount: string;
    readonly amountUSD: string;
    readonly gasPrice: string;
    readonly maxFeePerGas: string;
    readonly maxPriorityFeePerGas: string;
    readonly estimate: string;
    readonly limit: string;
}

/**
 * Estimation object.
 */
export interface SquidrouterEstimation {
    readonly fromAmount: string;
    readonly sendAmount: string;
    readonly toAmount: string;
    readonly toAmountMin: string;
    readonly router: {
        readonly fromChain: RouteElement[];
        readonly toChain: RouteElement[];
    };
    readonly feeCosts: FeeCost[];
    readonly gasCosts: GasCost[];
    readonly estimatedRouteDuration: number;
    readonly exchangeRate: string;
    readonly aggregatePriceImpact: string;
}
