import { Address } from '@ton/core';

export type DedustPoolsResponse = [DedustApiPoolInfo[]];

interface DedustApiPoolInfo {
    pool: {
        address: string;
        isStable: boolean;
        assets: [string, string];
        reserves: [string, string];
    };
    assetIn: string;
    assetOut: string;
    tradeFee: string;
    amountIn: string;
    amountOut: string;
}

export interface DedustTxStep {
    poolAddress: Address;
    amountOut: string;
    srcTokenAddress: string;
    dstTokenAddress: string;
}
