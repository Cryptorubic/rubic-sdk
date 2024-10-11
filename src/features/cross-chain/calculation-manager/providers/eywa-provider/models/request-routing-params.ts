import { EywaFeeEstimation } from './eywa-fee-estimation';

export interface EywaRoutingParams {
    params: {
        chainIdIn: number;
        chainIdOut: number;
        tokenIn: string;
        tokenOut: string;
        amountIn: string;
    };
    slippage: number;
}

export interface EywaRoutingResponse {
    amountIn: string;
    amountOut: string;
    amountOutWithoutSlippage: string;
    priceImpact: number;
    query: {
        params: EywaRoutingParams;
    };
    route: EywaRoute[];
    tokenInPrice: number;
    tokenOutPrice: number;
    totalFee: {
        amount: string;
        percent: string;
        type: string;
    };
    txs: unknown[];
}

export interface EywaRoute {
    chainId: number;
    type: string;
    params: {
        amountIn: string;
        amountInWithoutSlippage: string;
        amountOut: string;
        amountOutWithoutSlippage: string;
        chainIdIn: number;
        chainIdOut: number;
        slippage: number;
        tokenIn: EywaToken;
        tokenOut: EywaToken;
    };
    fees: EywaFees[];
    pool: {
        address: string;
        coins: string[];
        decimals: number[];
        type: string;
        lp: EywaToken;
    };
}

interface EywaFees {
    amount: string;
    percent: string;
    type: string;
    token: EywaToken;
}

interface EywaToken {
    address: string;
    chainId: number;
    decimals: number;
    name: string;
    originalName: string;
    originalSymbol: string;
    permit: boolean;
    permittable: boolean;
    symbol: string;
    tags: string[];
}

export interface EywaSwapTxRequest {
    routing: EywaRoutingResponse;
    estimate: EywaFeeEstimation;
    from: string;
    recipient: string;
}

export interface EywaSwapTxResponse {
    abi: string;
    to: string;
    value: string;
    args: EywaSwapArgs;
}

type EywaSwapArgs = [
    string[],
    string[],
    {
        deadline: string;
        executionPrice: string;
        r: string;
        s: string;
        v: number;
    }
];
