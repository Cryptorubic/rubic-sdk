// /* eslint-disable no-continue */
import { BigNumber } from 'ethers';
import { SyncSwapPathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/sync-swap-path-factory';
import {
    GetAmountParams,
    GroupAmounts,
    Path,
    PathWithAmounts,
    RouteDirection,
    RoutePoolData,
    Step,
    StepWithAmount
} from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/typings';

import {
    FOUR,
    granularity,
    MAX_FEE,
    MAX_LOOP_LIMIT,
    MAX_XP,
    ONE,
    STABLE_POOL_A,
    THREE,
    TWO,
    UINT128_MAX,
    UINT256_MAX,
    ZERO
} from './constants';
//
// import {
//     FOUR,
//     granularity,
//     LIQUIDITY_MIN_RESERVE,
//     MAX_FEE,
//     MAX_LOOP_LIMIT,
//     MAX_XP,
//     ONE,
//     STABLE_POOL_A,
//     THREE,
//     TWO,
//     UINT128_MAX,
//     UINT256_MAX,
//     ZERO
// } from './constants';
// import {
//     GetAmountParams,
//     GroupAmounts,
//     Path,
//     PathWithAmounts,
//     RouteDirection,
//     RoutePoolData,
//     RoutePools,
//     Step,
//     StepWithAmount
// } from './typings';
// import {
//     PathFactory
// } from "src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/utils/path-factory";
//
// function hasLiquidity(data: RoutePoolData, tokenIn?: string, amountOut?: BigNumber): boolean {
//     if (tokenIn && amountOut) {
//         const reserveOut =
//             data.tokenA.toLowerCase() === tokenIn.toLowerCase() ? data.reserveB : data.reserveA;
//         return reserveOut.gt(amountOut);
//     }
//     return data.reserveA.gte(LIQUIDITY_MIN_RESERVE) && data.reserveB.gte(LIQUIDITY_MIN_RESERVE);
// }
//
// function getPoolKey(address1: string, address2: string, poolType: string): string {
//     if (address1 < address2) {
//         return `${address1}:${address2}:${poolType}`;
//     }
//     return `${address2}:${address1}:${poolType}`;
// }
//
// // find all possible paths from token in to token out with route pools.
// // this is the first step of processing route pools after fetched.
// // eslint-disable-next-line complexity
// // export function findAllPossiblePaths(
// //     enableHops: boolean,
// //     routePools: RoutePools,
// //     tokenIn: string,
// //     _ts: number,
// //     _amountOut?: BigNumber
// // ): Path[] {
// //     const paths: Path[] = []; // all viable paths for swapping
// //
// //     // collect paths: direct
// //     for (const pool of routePools.pools.poolsDirect) {
// //         if (hasLiquidity(pool, tokenIn)) {
// //             const path = PathFactory.createPath([
// //                 {
// //                     pool,
// //                     tokenIn
// //                 }
// //             ]);
// //
// //             paths.push(path);
// //         }
// //     }
// //
// //     // exit if hops are disabled
// //     if (!enableHops) {
// //         return paths;
// //     }
// //
// //     // put pools to map for search
// //     const poolByTokens: Map<string, RoutePoolData> = new Map();
// //
// //     for (const pool of routePools.pools.poolsA) {
// //         if (hasLiquidity(pool)) {
// //             poolByTokens.set(getPoolKey(pool.tokenA, pool.tokenB, pool.poolType), pool);
// //         }
// //     }
// //
// //     for (const pool of routePools.pools.poolsB) {
// //         if (hasLiquidity(pool)) {
// //             poolByTokens.set(getPoolKey(pool.tokenA, pool.tokenB, pool.poolType), pool);
// //         }
// //     }
// //
// //     for (const pool of routePools.pools.poolsBase) {
// //         if (hasLiquidity(pool)) {
// //             poolByTokens.set(getPoolKey(pool.tokenA, pool.tokenB, pool.poolType), pool);
// //         }
// //     }
// //
// //     // multi-step paths with hops
// //     const length = routePools.routeTokens.length;
// //     const tokenOut = (
// //         tokenIn === routePools.tokenA ? routePools.tokenB : routePools.tokenA
// //     ).toLowerCase();
// //
// //     // collect paths: 1 hop
// //     for (let i = 0; i < length; i++) {
// //         const baseToken = routePools.routeTokens[i]!.toLowerCase();
// //
// //         // skip invalid paths
// //         if (baseToken === tokenIn || baseToken === tokenOut) {
// //             continue;
// //         }
// //
// //         const poolA1: RoutePoolData | undefined = poolByTokens.get(
// //             getPoolKey(tokenIn, baseToken, '1')
// //         );
// //         const poolA2: RoutePoolData | undefined = poolByTokens.get(
// //             getPoolKey(tokenIn, baseToken, '2')
// //         );
// //         // skip if pool A has no liquidity
// //         if (poolA1 === undefined && poolA2 === undefined) {
// //             continue;
// //         }
// //
// //         const poolB1: RoutePoolData | undefined = poolByTokens.get(
// //             getPoolKey(baseToken, tokenOut, '1')
// //         );
// //         const poolB2: RoutePoolData | undefined = poolByTokens.get(
// //             getPoolKey(baseToken, tokenOut, '2')
// //         );
// //         // skip if pool B has no liquidity
// //         if (poolB1 === undefined && poolB2 === undefined) {
// //             continue;
// //         }
// //
// //         if (poolA1 && poolB1) {
// //             const path = createPath([
// //                 {
// //                     pool: poolA1,
// //                     tokenIn
// //                 },
// //                 {
// //                     pool: poolB1,
// //                     tokenIn: baseToken
// //                 }
// //             ]);
// //
// //             paths.push(path);
// //         }
// //
// //         if (poolA1 && poolB2) {
// //             const path = createPath([
// //                 {
// //                     pool: poolA1,
// //                     tokenIn
// //                 },
// //                 {
// //                     pool: poolB2,
// //                     tokenIn: baseToken
// //                 }
// //             ]);
// //
// //             paths.push(path);
// //         }
// //
// //         if (poolA2 && poolB1) {
// //             const path = createPath([
// //                 {
// //                     pool: poolA2,
// //                     tokenIn
// //                 },
// //                 {
// //                     pool: poolB1,
// //                     tokenIn: baseToken
// //                 }
// //             ]);
// //
// //             paths.push(path);
// //         }
// //
// //         if (poolA2 && poolB2) {
// //             const path = createPath([
// //                 {
// //                     pool: poolA2,
// //                     tokenIn
// //                 },
// //                 {
// //                     pool: poolB2,
// //                     tokenIn: baseToken
// //                 }
// //             ]);
// //
// //             paths.push(path);
// //         }
// //     }
// //
// //     // collect paths: 2 hop
// //     for (let i = 0; i < length; i++) {
// //         // base token 1
// //         const baseToken1 = routePools.routeTokens[i]!.toLowerCase();
// //
// //         // skip invalid paths
// //         if (baseToken1 === tokenIn || baseToken1 === tokenOut) {
// //             continue;
// //         }
// //
// //         const poolA1: RoutePoolData | undefined = poolByTokens.get(
// //             getPoolKey(tokenIn, baseToken1, '1')
// //         );
// //         const poolA2: RoutePoolData | undefined = poolByTokens.get(
// //             getPoolKey(tokenIn, baseToken1, '2')
// //         );
// //         // skip if pool A has no liquidity
// //         if (poolA1 === undefined && poolA2 === undefined) {
// //             continue;
// //         }
// //
// //         for (let j = i + 1; j < length; j++) {
// //             // base token 2
// //             // skip identical bases
// //             if (i === j) {
// //                 continue;
// //             }
// //
// //             const baseToken2 = routePools.routeTokens[j]!.toLowerCase();
// //
// //             // skip invalid paths
// //             if (baseToken2 === tokenIn || baseToken2 === tokenOut || baseToken2 === baseToken1) {
// //                 continue;
// //             }
// //
// //             const poolBase1: RoutePoolData | undefined = poolByTokens.get(
// //                 getPoolKey(baseToken1, baseToken2, '1')
// //             );
// //             const poolBase2: RoutePoolData | undefined = poolByTokens.get(
// //                 getPoolKey(baseToken1, baseToken2, '2')
// //             );
// //             // skip if pool Base has no liquidity
// //             if (poolBase1 === undefined && poolBase2 === undefined) {
// //                 continue;
// //             }
// //
// //             // @TODO SyncSwap
// //             // if (ts !== SwapRouter.routeTimestamp()) {
// //             //     throw Error('expired');
// //             // }
// //
// //             const poolB1: RoutePoolData | undefined = poolByTokens.get(
// //                 getPoolKey(baseToken2, tokenOut, '1')
// //             );
// //             const poolB2: RoutePoolData | undefined = poolByTokens.get(
// //                 getPoolKey(baseToken2, tokenOut, '2')
// //             );
// //             // skip if pool B has no liquidity
// //             if (poolB1 === undefined && poolB2 === undefined) {
// //                 continue;
// //             }
// //
// //             if (poolA1 && poolBase1 && poolB1) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA1,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase1,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB1,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //
// //             if (poolA1 && poolBase1 && poolB2) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA1,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase1,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB2,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //
// //             if (poolA1 && poolBase2 && poolB1) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA1,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase2,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB1,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //
// //             if (poolA1 && poolBase2 && poolB2) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA1,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase2,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB2,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //
// //             if (poolA2 && poolBase1 && poolB1) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA2,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase1,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB1,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //
// //             if (poolA2 && poolBase1 && poolB2) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA2,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase1,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB2,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //
// //             if (poolA2 && poolBase2 && poolB1) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA2,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase2,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB1,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //
// //             if (poolA2 && poolBase2 && poolB2) {
// //                 const path = createPath([
// //                     {
// //                         pool: poolA2,
// //                         tokenIn
// //                     },
// //                     {
// //                         pool: poolBase2,
// //                         tokenIn: baseToken1
// //                     },
// //                     {
// //                         pool: poolB2,
// //                         tokenIn: baseToken2
// //                     }
// //                 ]);
// //
// //                 paths.push(path);
// //             }
// //         }
// //     }
// //
// //     return paths;
// // }
//
function copyStep(step: Step): Step {
    const pool: RoutePoolData = step.pool;

    return {
        pool: {
            isAlpha: pool.isAlpha,
            vault: pool.vault,
            pool: pool.pool,
            tokenA: pool.tokenA,
            tokenB: pool.tokenB,
            poolType: pool.poolType,
            reserveA: BigNumber.from(pool.reserveA),
            reserveB: BigNumber.from(pool.reserveB),
            swapFeeAB: pool.swapFeeAB,
            swapFeeBA: pool.swapFeeBA
        },
        tokenIn: step.tokenIn,
        swapFee: step.swapFee
    };
}

function getAmountOutClassic(params: GetAmountParams, checkOverflow: boolean): BigNumber {
    const amountIn = params.amount;
    const reserveIn = params.reserveIn;
    if (checkOverflow && reserveIn.add(amountIn).gt(UINT128_MAX)) {
        throw Error('overflow');
    }

    const amountInWithFee = amountIn.mul(MAX_FEE.sub(params.swapFee));
    if (checkOverflow && amountInWithFee.gt(UINT256_MAX)) {
        throw Error('overflow');
    }

    const numerator = amountInWithFee.mul(params.reserveOut);
    if (checkOverflow && numerator.gt(UINT256_MAX)) {
        throw Error('overflow');
    }

    const denominator = params.reserveIn.mul(MAX_FEE).add(amountInWithFee);
    if (checkOverflow && denominator.gt(UINT256_MAX)) {
        throw Error('overflow');
    }

    return numerator.div(denominator);
}

export function computeDFromAdjustedBalances(
    A: BigNumber,
    xp0: BigNumber,
    xp1: BigNumber,
    checkOverflow: boolean
): BigNumber {
    const s = xp0.add(xp1);

    if (s.isZero()) {
        return ZERO;
    }
    let prevD;
    let d = s;
    const nA = A.mul(TWO);

    for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
        const dSq = d.mul(d);

        if (checkOverflow && dSq.gt(UINT256_MAX)) {
            throw Error('overflow');
        }

        const d2 = dSq.div(xp0).mul(d);
        if (checkOverflow && d2.gt(UINT256_MAX)) {
            throw Error('overflow');
        }

        const dP = d2.div(xp1).div(FOUR);
        prevD = d;

        const d0 = nA.mul(s).add(dP.mul(TWO)).mul(d);
        if (checkOverflow && d0.gt(UINT256_MAX)) {
            throw Error('overflow');
        }

        d = d0.div(nA.sub(ONE).mul(d).add(dP.mul(THREE)));

        if (d.sub(prevD).abs().lte(ONE)) {
            return d;
        }
    }

    return d;
}

export function getY(A: BigNumber, x: BigNumber, d: BigNumber): BigNumber {
    const nA = A.mul(TWO);

    const c = d.mul(d).div(x.mul(TWO)).mul(d).div(nA.mul(TWO));

    const b = d.div(nA).add(x);

    let yPrev;
    let y = d;

    for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
        yPrev = y;
        y = y.mul(y).add(c).div(y.mul(TWO).add(b).sub(d));

        if (y.sub(yPrev).abs().lte(ONE)) {
            break;
        }
    }

    return y;
}

function getAmountOutStable(params: GetAmountParams, checkOverflow: boolean): BigNumber {
    const adjustedReserveIn = params.reserveIn.mul(params.tokenInPrecisionMultiplier!);
    if (checkOverflow && adjustedReserveIn.gt(MAX_XP)) {
        throw Error('overflow');
    }
    const adjustedReserveOut = params.reserveOut.mul(params.tokenOutPrecisionMultiplier!);
    if (checkOverflow && adjustedReserveOut.gt(MAX_XP)) {
        throw Error('overflow');
    }

    const amountIn = params.amount;
    const feeDeductedAmountIn = amountIn.sub(amountIn.mul(params.swapFee).div(MAX_FEE));
    const d = computeDFromAdjustedBalances(
        STABLE_POOL_A,
        adjustedReserveIn,
        adjustedReserveOut,
        checkOverflow
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const x = adjustedReserveIn.add(feeDeductedAmountIn.mul(params.tokenInPrecisionMultiplier!));
    const y = getY(STABLE_POOL_A, x, d);
    const dy = adjustedReserveOut.sub(y).sub(1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amountOut = dy.div(params.tokenOutPrecisionMultiplier!);

    return amountOut;
}

export function calculateAmountOut(params: GetAmountParams, checkOverflow: boolean): BigNumber {
    if (params.amount.isZero()) {
        return ZERO;
    }

    let amountOut;
    try {
        if (params.stable) {
            amountOut = getAmountOutStable(params, checkOverflow);
        } else {
            amountOut = getAmountOutClassic(params, checkOverflow);
        }
    } catch (error: unknown) {
        return ZERO;
    }

    return amountOut;
}

function splitAmounts2(amount: BigNumber, granularity: number): BigNumber[][] {
    const oneSplit = amount.div(granularity);
    if (oneSplit.isZero()) {
        return [];
    }

    const amounts: BigNumber[][] = [];

    for (let i = 0; i <= granularity; i++) {
        const a = oneSplit.mul(i);
        const b = oneSplit.mul(granularity - i);

        amounts.push([a, b]);
    }

    return amounts;
}

function splitAmounts3(amount: BigNumber, granularity: number): BigNumber[][] {
    const oneSplit = amount.div(granularity);
    if (oneSplit.isZero()) {
        return [];
    }

    const amounts: BigNumber[][] = [];

    for (let i = 0; i <= granularity; i++) {
        const a = oneSplit.mul(i);

        const remaining = granularity - i;
        for (let j = 0; j <= remaining; j++) {
            const b = oneSplit.mul(j);
            const c = oneSplit.mul(remaining - j);

            amounts.push([a, b, c]);
        }
    }

    return amounts;
}

function splitAmounts4(amount: BigNumber, granularity: number): BigNumber[][] {
    const oneSplit = amount.div(granularity);
    if (oneSplit.isZero()) {
        return [];
    }

    const amounts: BigNumber[][] = [];

    for (let i = 0; i <= granularity; i++) {
        const a = oneSplit.mul(i);

        const remaining = granularity - i;
        for (let j = 0; j <= remaining; j++) {
            const b = oneSplit.mul(j);

            const remaining2 = remaining - j;
            for (let k = 0; k <= remaining2; k++) {
                const c = oneSplit.mul(k);
                const d = oneSplit.mul(remaining2 - k);

                amounts.push([a, b, c, d]);
            }
        }
    }

    return amounts;
}

function splitAmounts5(amount: BigNumber, granularity: number): BigNumber[][] {
    const oneSplit = amount.div(granularity);
    if (oneSplit.isZero()) {
        return [];
    }

    const amounts: BigNumber[][] = [];

    for (let i = 0; i <= granularity; i++) {
        const a = oneSplit.mul(i);

        const remaining = granularity - i;
        for (let j = 0; j <= remaining; j++) {
            const b = oneSplit.mul(j);

            const remaining2 = remaining - j;
            for (let k = 0; k <= remaining2; k++) {
                const c = oneSplit.mul(k);

                const remaining3 = remaining2 - k;
                for (let l = 0; l <= remaining3; l++) {
                    const d = oneSplit.mul(l);
                    const e = oneSplit.mul(remaining3 - l);

                    amounts.push([a, b, c, d, e]);
                }
            }
        }
    }

    return amounts;
}

function fixSplitAmounts(amount: BigNumber, amounts: BigNumber[][]): BigNumber[][] {
    for (const group of amounts) {
        let sum: BigNumber = ZERO;

        for (const amount of group) {
            sum = sum.add(amount);
        }

        if (!sum.eq(amount)) {
            const diff: BigNumber = amount.sub(sum);

            for (const amount of group) {
                // only add diff to non-zero amount
                if (!amount.isZero()) {
                    group[0] = group[0]!.add(diff);
                    break;
                }
            }
        }
    }

    return amounts;
}

export async function splitAmount(amount: BigNumber, parts: number): Promise<BigNumber[][]> {
    if (parts === 0) {
        return [];
    }

    if (parts === 1) {
        return [[amount]];
    }

    if (parts === 2) {
        return fixSplitAmounts(amount, splitAmounts2(amount, granularity));
    }

    if (parts === 3) {
        return fixSplitAmounts(amount, splitAmounts3(amount, granularity));
    }

    if (parts === 4) {
        return fixSplitAmounts(amount, splitAmounts4(amount, granularity));
    }

    if (parts === 5) {
        return fixSplitAmounts(amount, splitAmounts5(amount, granularity));
    }

    throw Error('Unsupported split parts');
}

function calculateAmountOutForStep(
    step: Step,
    amountIn: BigNumber,
    quoteIn: BigNumber
): [BigNumber, BigNumber, Step | null] {
    const isTokenAIn = step.pool.tokenA === step.tokenIn;
    const [reserveIn, reserveOut] = isTokenAIn
        ? [step.pool.reserveA, step.pool.reserveB]
        : [step.pool.reserveB, step.pool.reserveA];

    let tokenInPrecisionMultiplier: BigNumber;
    let tokenOutPrecisionMultiplier: BigNumber;

    // create multiplier for stable pools
    const stable = step.pool.poolType === '2';
    if (stable) {
        // const [tokenInAddress, tokenOutAddress] = isTokenAIn
        //     ? [step.pool.tokenA, step.pool.tokenB]
        //     : [step.pool.tokenB, step.pool.tokenA];

        // @TODO SyncSwap add tokenInPrecisionMultiplier

        // const tokenIn = TokenRegistry.getTokenByAddress(tokenInAddress);
        // const tokenOut = TokenRegistry.getTokenByAddress(tokenOutAddress);
        //
        // if (tokenIn == null || tokenOut == null) {
        //     throw Error('Unknown token found');
        // }
        //
        // if (tokenIn.decimals > 18 || tokenOut.decimals > 18) {
        //     throw Error('Unknown token found');
        // }
        //
        // tokenInPrecisionMultiplier = Numbers.pow(18 - tokenIn.decimals);
        // tokenOutPrecisionMultiplier = Numbers.pow(18 - tokenOut.decimals);
        tokenInPrecisionMultiplier = ZERO;
        tokenOutPrecisionMultiplier = ZERO;
    } else {
        tokenInPrecisionMultiplier = ZERO;
        tokenOutPrecisionMultiplier = ZERO;
    }

    const swapFee = BigNumber.from(step.swapFee); // wrap
    const amountOut = calculateAmountOut(
        {
            stable,
            amount: amountIn,
            reserveIn,
            reserveOut,
            swapFee,
            tokenInPrecisionMultiplier,
            tokenOutPrecisionMultiplier
        },
        true
    );

    let quoteOut: BigNumber = ZERO;
    let updatedStep: Step | null = null;
    if (!amountOut.isZero()) {
        // update reserves
        if (true) {
            updatedStep = copyStep(step);
            if (isTokenAIn) {
                updatedStep.pool.reserveA = step.pool.reserveA.add(amountIn);
                updatedStep.pool.reserveB = step.pool.reserveB.sub(amountOut);
            } else {
                updatedStep.pool.reserveB = step.pool.reserveB.add(amountIn);
                updatedStep.pool.reserveA = step.pool.reserveA.sub(amountOut);
            }
        }

        // calculate quote
        quoteOut = SyncSwapPathFactory.calculateQuoteOut({
            stable,
            amount: quoteIn, // quote
            reserveIn,
            reserveOut,
            swapFee,
            tokenInPrecisionMultiplier,
            tokenOutPrecisionMultiplier
        });
    }

    return [amountOut, quoteOut, updatedStep];
}

// Calculate output amount and amounts of every steps for a path.
// Returns `null` if path failed.
export function calculatePathAmountsByInput(
    path: Path,
    amountIn: BigNumber,
    _updateReserves: boolean
): PathWithAmounts | null {
    const stepsWithAmount: StepWithAmount[] = [];
    let amountInNext: BigNumber = amountIn;
    let quoteInNext: BigNumber = amountIn;

    // calculate amount for each step
    for (let i = 0; i < path.length; i++) {
        const step: Step = path[i]!;

        const [stepAmountOut, stepQuoteOut, updatedStep] = calculateAmountOutForStep(
            step,
            amountInNext,
            quoteInNext
        );

        if (stepAmountOut.isZero()) {
            return null;
        }
        // record amount
        stepsWithAmount.push({
            ...step,
            updatedStep,
            amountIn: amountInNext
        });

        amountInNext = stepAmountOut; // use step output as input of next step
        quoteInNext = stepQuoteOut;
    }

    const pathAmountOut = amountInNext; // amount out of the end step
    const pathQuoteOut = quoteInNext;

    const amounts = {
        direction: RouteDirection.EXACT_IN,
        stepsWithAmount,
        amountOut: pathAmountOut,
        amountIn,
        quote: pathQuoteOut
    };

    return amounts;
}

export async function calculateGroupAmounts(
    paths: Path[],
    amounts: BigNumber[] // amounts must match the length of paths
): Promise<GroupAmounts | null> {
    const pathsWithAmounts: PathWithAmounts[] = [];
    let amountOut: BigNumber = ZERO;
    let quoteOut: BigNumber = ZERO;
    const groupPaths = paths;

    const lastSteps: Map<string, Step> = new Map();

    // for each path
    for (let i = 0; i < groupPaths.length; i++) {
        const pathAmountIn: BigNumber = amounts[i]!;
        if (pathAmountIn.isZero()) {
            // eslint-disable-next-line no-continue
            continue;
        }

        const path: Path = groupPaths[i]!;

        // update steps to last states if possible
        for (let j = 0; j < path.length; j++) {
            const lastStep: Step | undefined = lastSteps.get(path[j]!.pool.pool);
            if (lastStep !== undefined) {
                path[j] = copyStep(lastStep);
            }
        }

        const pathWithAmounts: PathWithAmounts | null = calculatePathAmountsByInput(
            path,
            pathAmountIn,
            true // update reserves
        );

        // path will be removed from group if failed
        if (pathWithAmounts != null) {
            // set as last step with updated reserves
            for (const step of pathWithAmounts.stepsWithAmount) {
                if (step.updatedStep !== null) {
                    lastSteps.set(step.pool.pool, step.updatedStep);
                }
            }

            pathsWithAmounts.push(pathWithAmounts);
            amountOut = amountOut.add(pathWithAmounts.amountOut);
            quoteOut = quoteOut.add(pathWithAmounts.quote);
        }
    }

    return {
        pathsWithAmounts,
        amountOut,
        quoteOut
    };
}

// function xm(e, n, r, t) {
//     const mm = 3;
//     if (e.length <= mm) return e;
//     let i;
//     const a = [];
//     const s = new Map();
//     const o = (0, m.Z)(e);
//     try {
//         for (o.s(); !(i = o.n()).done; ) {
//             const l = i.value;
//             const d = Om(l, r, !1);
//             d !== null && (a.push(l), s.set(l, d));
//         }
//     } catch (h) {
//         o.e(h);
//     } finally {
//         o.f();
//     }
//     if (a.length <= mm) return a;
//     if (
//         (a.sort(function (e, n) {
//             const r = s.get(e);
//             const t = s.get(n);
//             return (
//                 (0, c.Z)(r && t, 'No amounts for available path'),
//                 r.amountOut.gt(t.amountOut) ? -1 : 1
//             );
//         })
//     )
//     return a.slice(0, u ? mm : 1);
// }
