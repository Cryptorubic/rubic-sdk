import { BigNumber } from 'ethers';

export const MAX_LOOP_LIMIT = 256;
export const MAX_FEE = BigNumber.from(100000); // 1e5
export const STABLE_POOL_A = BigNumber.from(1000);
export const ZERO = BigNumber.from(0);
export const ONE = BigNumber.from(1);
export const TWO = BigNumber.from(2);
export const THREE = BigNumber.from(3);
export const FOUR = BigNumber.from(4);
export const granularity = 10; // div to 10 parts

export const UINT128_MAX = BigNumber.from(2).pow(128).sub(1);
export const UINT256_MAX = BigNumber.from(2).pow(256).sub(1);

// @TODO SyncSwap
export const MAX_XP = BigNumber.from(2).pow(256).sub(1);
export const ETHER = BigNumber.from(10).pow(18);
