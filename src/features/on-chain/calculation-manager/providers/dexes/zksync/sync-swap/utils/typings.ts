import { BigNumber } from 'ethers';

export interface RoutePools {
    directPoolOptimal: RoutePoolData;
    routeTokens: string[];
    tokenA: string;
    tokenB: string;
    timestamp: number;
    pools: RoutePoolsBlockchain;
}

export interface RoutePoolData {
    isAlpha?: boolean;
    vault?: string;
    pool: string;
    poolType: string;
    reserveA: BigNumber;
    reserveB: BigNumber;
    swapFeeAB: string;
    swapFeeBA: string;
    tokenA: string;
    tokenB: string;
}

export interface RoutePoolsBlockchain {
    poolsA: RoutePoolData[];
    poolsB: RoutePoolData[];
    poolsBase: RoutePoolData[];
    poolsDirect: RoutePoolData[];
}

export interface GroupAmounts {
    pathsWithAmounts: PathWithAmounts[];
    amountOut: BigNumber;
    quoteOut: BigNumber;
}

export interface GetAmountParams {
    stable: boolean;
    amount: BigNumber;
    reserveIn: BigNumber;
    reserveOut: BigNumber;
    swapFee: BigNumber;
    tokenInPrecisionMultiplier?: BigNumber;
    tokenOutPrecisionMultiplier?: BigNumber;
}

export interface SwapRoute {
    tokenIn: string;
    tokenOut: string;
    found: boolean;
    amountIn: BigNumber;
    amountOut: BigNumber;
    quote: BigNumber;
    paths: PathWithAmounts[];
    priceImpact: BigNumber;
    gas: BigNumber;
}

export interface Step {
    pool: RoutePoolData;
    swapFee: string;
    // tokenA: string;
    // tokenB: string;
    tokenIn: string;
}

export type Path = Step[];

export interface StepWithAmount extends Step {
    amountIn: BigNumber;
    updatedStep: Step | null;
    // amountOut: BigNumber;
}

export enum RouteDirection {
    EXACT_IN,
    EXACT_OUT
}

export interface PathWithAmounts {
    direction: RouteDirection;
    stepsWithAmount: StepWithAmount[];
    amountIn: BigNumber;
    amountOut: BigNumber;
    quote: BigNumber;
}

export type BestPathsWithAmounts = {
    found: boolean;
    direction: RouteDirection;
    pathsWithAmounts: PathWithAmounts[];
    amountIn: BigNumber;
    amountOut: BigNumber;
    quote: BigNumber;
    bestPriceImpact: BigNumber | null;
    gas: BigNumber;
};
