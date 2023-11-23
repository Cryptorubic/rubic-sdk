import {
    AmountRestrictionType,
    ExpenseType,
    RoutingResultType,
    SwapperType
} from './rango-api-common-types';

export interface RangoBestRouteResponse {
    requestId: string;
    resultType: RoutingResultType;
    route: RangoBestRouteSimulationResult | null;
    error: string | null;
}

export interface RangoBestRouteSimulationResult {
    from: RangoResponseToken;
    to: RangoResponseToken;
    outputAmount: string;
    outputAmountMin: string;
    outputAmountUsd: number | null;
    swapper: RangoSwapperMeta;
    path: RangoQuotePath[] | null;
    fee: RangoSwapFee[];
    feeUsd: number | null;
    amountRestriction: RangoAmountRestriction | null;
    estimatedTimeInSeconds: number;
}

interface RangoSwapperMeta {
    id: string;
    title: string;
    logo: string;
    swapperGroup: string;
    types: SwapperType[];
}

interface RangoResponseToken {
    blockchain: string;
    chainId: string | null;
    address: string | null;
    symbol: string;
    name: string;
    decimals: number;
    image: string;
    blockchainImage: string;
    usdPrice: number | null;
    isPopular: boolean;
}

interface RangoQuotePath {
    from: RangoResponseToken;
    to: RangoResponseToken;
    swapper: RangoSwapperMeta;
    swapperType: SwapperType;
    expectedOutput: string;
    estimatedTimeInSeconds: number;
}

interface RangoSwapFee {
    name: string;
    token: RangoResponseToken;
    expenseType: ExpenseType;
    amount: string;
}

interface RangoAmountRestriction {
    min: string | null;
    max: string | null;
    type: AmountRestrictionType;
}
