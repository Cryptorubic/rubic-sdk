export interface PoolInfo {
    pool: string;
    poolType: string; // '0' | '1' | '2';
    reserveA: string;
    reserveB: string;
    swapFeeAB: string;
    swapFeeBA: string;
    tokenA: string;
    tokenB: string;
}
