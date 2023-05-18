import { BigNumber } from 'ethers';

import { Path, RoutePoolData, RoutePools, Step } from './typings';

export class PathFactoryV2 {
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
            routePool.reserveA.gte(PathFactoryV2.liquidityMinReserve) &&
            routePool.reserveB.gte(PathFactoryV2.liquidityMinReserve)
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
                        PathFactoryV2.createPath([
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
                            PathFactoryV2.createPath([
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

        // Direct pools
        for (const pool of poolsDirect) {
            if (PathFactoryV2.hasLiquidity(pool, tokenIn)) {
                const path = PathFactoryV2.createPath([
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
            if (PathFactoryV2.hasLiquidity(pool)) {
                poolsByPoolKey.set(
                    PathFactoryV2.getPoolKey(pool.tokenA, pool.tokenB, pool.poolType),
                    pool
                );
            }
        }

        // 1 hop
        for (const baseToken of routeTokens) {
            // eslint-disable-next-line no-continue
            if (baseToken === tokenIn || baseToken === tokenOut) continue;

            const poolA1 = poolsByPoolKey.get(PathFactoryV2.getPoolKey(tokenIn, baseToken, '1'));
            const poolA2 = poolsByPoolKey.get(PathFactoryV2.getPoolKey(tokenIn, baseToken, '2'));

            const poolB1 = poolsByPoolKey.get(PathFactoryV2.getPoolKey(baseToken, tokenOut, '1'));
            const poolB2 = poolsByPoolKey.get(PathFactoryV2.getPoolKey(baseToken, tokenOut, '2'));

            paths.push(
                ...PathFactoryV2.getPathsWith1Hop(
                    [poolA1, poolA2].filter(Boolean) as RoutePoolData[],
                    [poolB1, poolB2].filter(Boolean) as RoutePoolData[],
                    tokenIn,
                    baseToken
                )
            );
        }

        // 2 hops
        for (const baseToken1 of routeTokens) {
            if (baseToken1 === tokenIn || baseToken1 === tokenOut) {
                // eslint-disable-next-line no-continue
                continue;
            }
            const poolA1 = poolsByPoolKey.get(PathFactoryV2.getPoolKey(tokenIn, baseToken1, '1'));
            const poolA2 = poolsByPoolKey.get(PathFactoryV2.getPoolKey(tokenIn, baseToken1, '2'));

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
                    PathFactoryV2.getPoolKey(baseToken1, baseToken2, '1')
                );
                const poolBase2 = poolsByPoolKey.get(
                    PathFactoryV2.getPoolKey(baseToken1, baseToken2, '2')
                );

                const poolB1 = poolsByPoolKey.get(
                    PathFactoryV2.getPoolKey(baseToken2, tokenOut, '1')
                );
                const poolB2 = poolsByPoolKey.get(
                    PathFactoryV2.getPoolKey(baseToken2, tokenOut, '2')
                );

                paths.push(
                    ...PathFactoryV2.getPathsWith2Hops(
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
}
