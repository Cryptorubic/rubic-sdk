import { BigNumber } from 'ethers';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { SyncSwapRouter } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/utils/sync-swap-router';

import { MAX_FEE, STABLE_POOL_A, ZERO } from './constants';
import { GetAmountParams, Path, RoutePoolData, RoutePools, Step } from './typings';

export class SyncSwapPathFactory {
    private static readonly liquidityMinReserve = BigNumber.from(1000);

    public static hasLiquidity(
        routePool: RoutePoolData,
        tokenInAddress?: string,
        amountOut?: BigNumber
    ): boolean {
        if (tokenInAddress && amountOut) {
            const reserveOut =
                routePool.tokenA === tokenInAddress ? routePool.reserveB : routePool.reserveA;
            return reserveOut.gt(amountOut);
        }

        return (
            routePool.reserveA.gte(SyncSwapPathFactory.liquidityMinReserve) &&
            routePool.reserveB.gte(SyncSwapPathFactory.liquidityMinReserve)
        );
    }

    private static createPath(steps: { routePool: RoutePoolData; tokenInAddress: string }[]): Path {
        return steps.map(({ routePool, tokenInAddress }) => {
            const step: Step = {
                pool: routePool,
                tokenIn: tokenInAddress,
                swapFee:
                    tokenInAddress === routePool.tokenA ? routePool.swapFeeAB : routePool.swapFeeBA
            };

            return step;
        });
    }

    private static getPoolKey(
        tokenAAddress: string,
        tokenBAddress: string,
        poolType: string
    ): string {
        return tokenAAddress < tokenBAddress
            ? `${tokenAAddress}:${tokenBAddress}:${poolType}`
            : `${tokenBAddress}:${tokenAAddress}:${poolType}`;
    }

    private static getPathsWith1Hop(
        poolsA: RoutePoolData[],
        poolsB: RoutePoolData[],
        tokenIn: string,
        baseToken: string
    ): Path[] {
        const paths: Path[] = [];

        for (const poolA of poolsA) {
            for (const poolB of poolsB) {
                if (poolA && poolB) {
                    paths.push(
                        SyncSwapPathFactory.createPath([
                            { routePool: poolA, tokenInAddress: tokenIn },
                            { routePool: poolB, tokenInAddress: baseToken }
                        ])
                    );
                }
            }
        }

        return paths;
    }

    private static getPathsWith2Hops(
        poolsA: RoutePoolData[],
        poolsBase: RoutePoolData[],
        poolsB: RoutePoolData[],
        tokenIn: string,
        baseToken1: string,
        baseToken2: string
    ): Path[] {
        const paths: Path[] = [];

        for (const poolA of poolsA) {
            for (const poolBase of poolsBase) {
                for (const poolB of poolsB) {
                    if (poolA && poolBase && poolB) {
                        paths.push(
                            SyncSwapPathFactory.createPath([
                                { routePool: poolA, tokenInAddress: tokenIn },
                                { routePool: poolBase, tokenInAddress: baseToken1 },
                                { routePool: poolB, tokenInAddress: baseToken2 }
                            ])
                        );
                    }
                }
            }
        }

        return paths;
    }

    public static findAllPossiblePaths(
        tokenIn: string,
        tokenOut: string,
        routePools: RoutePools,
        enableHops = true
    ): Path[] {
        const {
            pools: { poolsDirect, poolsA, poolsB, poolsBase },
            routeTokens
        } = routePools;
        const paths: Path[] = [];

        for (const pool of poolsDirect) {
            if (SyncSwapPathFactory.hasLiquidity(pool, tokenIn)) {
                const path = SyncSwapPathFactory.createPath([
                    {
                        routePool: pool,
                        tokenInAddress: tokenIn
                    }
                ]);

                paths.push(path);
            }
        }

        if (!enableHops) return paths;

        const poolsByPoolKey: Map<string, RoutePoolData> = new Map();
        for (const pool of [...poolsA, ...poolsB, ...poolsBase]) {
            if (SyncSwapPathFactory.hasLiquidity(pool)) {
                poolsByPoolKey.set(
                    SyncSwapPathFactory.getPoolKey(pool.tokenA, pool.tokenB, pool.poolType),
                    pool
                );
            }
        }

        for (const baseToken of routeTokens) {
            if (baseToken === tokenIn || baseToken === tokenOut) {
                // eslint-disable-next-line no-continue
                continue;
            }

            const poolA1 = poolsByPoolKey.get(
                SyncSwapPathFactory.getPoolKey(tokenIn, baseToken, '1')
            );
            const poolA2 = poolsByPoolKey.get(
                SyncSwapPathFactory.getPoolKey(tokenIn, baseToken, '2')
            );

            const poolB1 = poolsByPoolKey.get(
                SyncSwapPathFactory.getPoolKey(baseToken, tokenOut, '1')
            );
            const poolB2 = poolsByPoolKey.get(
                SyncSwapPathFactory.getPoolKey(baseToken, tokenOut, '2')
            );

            paths.push(
                ...SyncSwapPathFactory.getPathsWith1Hop(
                    [poolA1, poolA2].filter(Boolean) as RoutePoolData[],
                    [poolB1, poolB2].filter(Boolean) as RoutePoolData[],
                    tokenIn,
                    baseToken
                )
            );
        }

        for (const baseToken1 of routeTokens) {
            if (baseToken1 === tokenIn || baseToken1 === tokenOut) {
                // eslint-disable-next-line no-continue
                continue;
            }
            const poolA1 = poolsByPoolKey.get(
                SyncSwapPathFactory.getPoolKey(tokenIn, baseToken1, '1')
            );
            const poolA2 = poolsByPoolKey.get(
                SyncSwapPathFactory.getPoolKey(tokenIn, baseToken1, '2')
            );

            for (const baseToken2 of routeTokens) {
                if (
                    baseToken2 === tokenIn ||
                    baseToken2 === tokenOut ||
                    baseToken2 === baseToken1
                ) {
                    // eslint-disable-next-line no-continue
                    continue;
                }

                const poolBase1 = poolsByPoolKey.get(
                    SyncSwapPathFactory.getPoolKey(baseToken1, baseToken2, '1')
                );
                const poolBase2 = poolsByPoolKey.get(
                    SyncSwapPathFactory.getPoolKey(baseToken1, baseToken2, '2')
                );

                const poolB1 = poolsByPoolKey.get(
                    SyncSwapPathFactory.getPoolKey(baseToken2, tokenOut, '1')
                );
                const poolB2 = poolsByPoolKey.get(
                    SyncSwapPathFactory.getPoolKey(baseToken2, tokenOut, '2')
                );

                paths.push(
                    ...SyncSwapPathFactory.getPathsWith2Hops(
                        [poolA1, poolA2].filter(Boolean) as RoutePoolData[],
                        [poolBase1, poolBase2].filter(Boolean) as RoutePoolData[],
                        [poolB1, poolB2].filter(Boolean) as RoutePoolData[],
                        tokenIn,
                        baseToken1,
                        baseToken2
                    )
                );
            }
        }

        return paths;
    }

    public static async getBestPath(
        paths: Path[],
        amountIn: string,
        blockchainName: EvmBlockchainName
    ): Promise<Path[]> {
        const pathAmountIn = BigNumber.from(amountIn);
        const pathsWithAmount = await Promise.all(
            paths.map(async (path, index) => ({
                pathWithAmounts: await SyncSwapRouter.calculatePathAmountsByInput(
                    path,
                    pathAmountIn,
                    false,
                    blockchainName
                ),
                index
            }))
        );
        const sortedIndexes = pathsWithAmount
            .sort((next, prev) => {
                if (!prev.pathWithAmounts) {
                    return next.pathWithAmounts?.amountOut ? -1 : 1;
                }
                if (!next.pathWithAmounts) {
                    return 1;
                }
                return prev.pathWithAmounts.amountOut.lte(next.pathWithAmounts.amountOut) ? 1 : -1;
            })
            .map(path => path.index);
        return paths.filter((_el, index) => sortedIndexes.slice(-4).includes(index));
    }

    private static getQuoteOutStable(params: GetAmountParams): BigNumber {
        const multiplier = 10000;

        const adjustedReserveIn = params.reserveIn
            .mul(params.tokenInPrecisionMultiplier!)
            .mul(multiplier);
        const adjustedReserveOut = params.reserveOut
            .mul(params.tokenOutPrecisionMultiplier!)
            .mul(multiplier);

        const amountIn = params.amount;
        const feeDeductedAmountIn = amountIn.sub(amountIn.mul(params.swapFee).div(MAX_FEE));

        const d = SyncSwapRouter.computeDFromAdjustedBalances(
            STABLE_POOL_A,
            adjustedReserveIn,
            adjustedReserveOut,
            false
        );

        const x = adjustedReserveIn.add(
            feeDeductedAmountIn.mul(params.tokenInPrecisionMultiplier!)
        );
        const y = SyncSwapRouter.getY(STABLE_POOL_A, x, d);
        const dy = adjustedReserveOut.sub(y).sub(1);

        return dy.div(params.tokenOutPrecisionMultiplier!);
    }

    private static getQuoteOutClassic(params: GetAmountParams): BigNumber {
        const amountIn = params.amount;
        const multiplier = 100000;

        const amountInWithFee = amountIn.mul(MAX_FEE.sub(params.swapFee));
        return amountInWithFee
            .mul(params.reserveOut.mul(multiplier))
            .div(params.reserveIn.mul(multiplier).mul(MAX_FEE));
    }

    public static calculateQuoteOut(params: GetAmountParams): BigNumber {
        if (params.amount.isZero()) {
            return ZERO;
        }

        return params.stable
            ? SyncSwapPathFactory.getQuoteOutStable(params)
            : SyncSwapPathFactory.getQuoteOutClassic(params);
    }
}
