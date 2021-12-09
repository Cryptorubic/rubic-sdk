import { PCacheable } from 'ts-cacheable';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import {
    FeeAmount,
    LiquidityPool
} from '@features/swap/providers/ethereum/uni-swap-v3/utils/liquidity-pool-controller/models/liquidity-pool';
import { compareAddresses } from '@common/utils/blockchain';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import {
    factoryContractAbi,
    factoryContractAddress
} from '@features/swap/providers/ethereum/uni-swap-v3/utils/liquidity-pool-controller/constants/factory-contract-data';
import { EMPTY_ADDRESS } from '@core/blockchain/web3-public/constants/EMPTY_ADDRESS';
import { notNull } from '@common/utils/object';
import { UniSwapV3Route } from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-route';
import { Token } from '@core/blockchain/tokens/token';
import { Cache } from '@common/decorators/cache.decorator';
import {
    quoterContractAbi,
    quoterContractAddress
} from '@features/swap/providers/ethereum/uni-swap-v3/utils/liquidity-pool-controller/constants/quoter-contract-data';
import { getRouterTokensAndLiquidityPools } from '@features/swap/providers/ethereum/uni-swap-v3/utils/liquidity-pool-controller/constants/router-liqudity-pools';

interface GetQuoterMethodsDataOptions {
    routesLiquidityPools: LiquidityPool[];
    from: PriceTokenAmount;
    toToken: Token;
}

/**
 * Works with requests, related to Uniswap v3 liquidity pools.
 */
export class LiquidityPoolsController {
    /**
     * Converts uni v3 route to encoded bytes string to pass it to contract.
     * Structure of encoded string: '0x${tokenAddress_0}${toHex(fee_0)}${tokenAddress_1}${toHex(fee_1)}...${tokenAddress_n}.
     * toHex(fee_i) must be of length 6, so leading zeroes are added.
     * @param pools Liquidity pools, included in route.
     * @param initialTokenAddress From token address.
     * @return string Encoded string.
     */
    @Cache
    public static getEncodedPoolsPath(pools: LiquidityPool[], initialTokenAddress: string): string {
        let contractPath = initialTokenAddress.slice(2).toLowerCase();
        let lastTokenAddress = initialTokenAddress;
        pools.forEach(pool => {
            contractPath += pool.fee.toString(16).padStart(6, '0');
            const newToken = compareAddresses(pool.token0.address, lastTokenAddress)
                ? pool.token1
                : pool.token0;
            contractPath += newToken.address.slice(2).toLowerCase();
            lastTokenAddress = newToken.address;
        });
        return `0x${contractPath}`;
    }

    /**
     * Returns swap method's name and arguments to pass it to Quoter contract.
     * @param poolsPath Pools, included in the route.
     * @param from From token and amount.
     * @param toToken To token.
     */
    @Cache
    private static getQuoterMethodData(
        poolsPath: LiquidityPool[],
        from: PriceTokenAmount,
        toToken: Token
    ): {
        poolsPath: LiquidityPool[];
        methodData: MethodData;
    } {
        if (poolsPath.length === 1) {
            return {
                poolsPath,
                methodData: {
                    methodName: 'quoteExactInputSingle',
                    methodArguments: [
                        from.address,
                        toToken.address,
                        poolsPath[0].fee,
                        from.weiAmount,
                        0
                    ]
                }
            };
        }
        return {
            poolsPath,
            methodData: {
                methodName: 'quoteExactInput',
                methodArguments: [
                    LiquidityPoolsController.getEncodedPoolsPath(poolsPath, from.address),
                    from.weiAmount
                ]
            }
        };
    }

    private routerTokens: Token[] | undefined;

    private routerLiquidityPools: LiquidityPool[] | undefined;

    private readonly feeAmounts: FeeAmount[] = [500, 3000, 10000];

    constructor(private readonly web3Public: Web3Public) {}

    private async getRouterTokensAndLiquidityPools(): Promise<{
        routerTokens: Token[];
        routerLiquidityPools: LiquidityPool[];
    }> {
        if (this.routerTokens && this.routerLiquidityPools) {
            return {
                routerTokens: this.routerTokens,
                routerLiquidityPools: this.routerLiquidityPools
            };
        }

        const routerParams = await getRouterTokensAndLiquidityPools();
        this.routerTokens = routerParams.routerTokens;
        this.routerLiquidityPools = routerParams.routerLiquidityPools;
        return routerParams;
    }

    /**
     * Returns all liquidity pools, containing passed tokens addresses, and concatenates with most popular pools.
     */
    @PCacheable({
        maxAge: 1000 * 60 * 10,
        maxCacheCount: 10
    })
    private async getAllLiquidityPools(
        firstToken: Token,
        secondToken: Token
    ): Promise<LiquidityPool[]> {
        const { routerTokens, routerLiquidityPools } =
            await this.getRouterTokensAndLiquidityPools();

        let getPoolMethodArguments: { tokenA: Token; tokenB: Token; fee: FeeAmount }[] = [];
        getPoolMethodArguments.push(
            ...Object.values(routerTokens)
                .filter(
                    routerToken =>
                        !compareAddresses(firstToken.address, routerToken.address) &&
                        !compareAddresses(secondToken.address, routerToken.address)
                )
                .map(routerToken =>
                    this.feeAmounts
                        .map(fee => [
                            { tokenA: firstToken, tokenB: routerToken, fee },
                            { tokenA: secondToken, tokenB: routerToken, fee }
                        ])
                        .flat()
                )
                .flat()
        );
        getPoolMethodArguments.push(
            ...this.feeAmounts.map(fee => ({
                tokenA: firstToken,
                tokenB: secondToken,
                fee
            }))
        );
        getPoolMethodArguments = getPoolMethodArguments.filter(
            methodArguments =>
                !routerLiquidityPools.find(
                    pool =>
                        pool.isPoolWithTokens(
                            methodArguments.tokenA.address,
                            methodArguments.tokenB.address
                        ) && pool.fee === methodArguments.fee
                )
        );

        const poolsAddresses = (
            await this.web3Public.multicallContractMethods<{ 0: string }>(
                factoryContractAddress,
                factoryContractAbi,
                getPoolMethodArguments.map(methodArguments => ({
                    methodName: 'getPool',
                    methodArguments: [
                        methodArguments.tokenA.address,
                        methodArguments.tokenB.address,
                        methodArguments.fee
                    ]
                }))
            )
        ).map(result => result.output![0]);

        return poolsAddresses
            .map((poolAddress, index) => {
                if (poolAddress !== EMPTY_ADDRESS) {
                    return new LiquidityPool(
                        poolAddress,
                        getPoolMethodArguments[index].tokenA,
                        getPoolMethodArguments[index].tokenB,
                        getPoolMethodArguments[index].fee
                    );
                }
                return null;
            })
            .filter(notNull)
            .concat(routerLiquidityPools);
    }

    /**
     * Returns all routes between given tokens with output amount.
     * @param from From token and amount.
     * @param toToken To token.
     * @param routeMaxTransitPools Max amount of transit pools.
     */
    public async getAllRoutes(
        from: PriceTokenAmount,
        toToken: PriceToken,
        routeMaxTransitPools: number
    ): Promise<UniSwapV3Route[]> {
        const routesLiquidityPools = await this.getAllLiquidityPools(from, toToken);
        const options: GetQuoterMethodsDataOptions = {
            routesLiquidityPools,
            from,
            toToken
        };
        const quoterMethodsData = [...Array(routeMaxTransitPools + 1)]
            .map((_, index) => this.getQuoterMethodsData(options, [], from.address, index))
            .flat();

        return this.web3Public
            .multicallContractMethods<{ 0: string }>(
                quoterContractAddress,
                quoterContractAbi,
                quoterMethodsData.map(quoterMethodData => quoterMethodData.methodData)
            )
            .then(results => {
                return results
                    .map((result, index) => {
                        if (result.success) {
                            return {
                                outputAbsoluteAmount: new BigNumber(result.output![0]),
                                poolsPath: quoterMethodsData[index].poolsPath,
                                initialTokenAddress: from.address
                            };
                        }
                        return null;
                    })
                    .filter(notNull);
            });
    }

    /**
     * Returns swap methods' names and arguments, built with passed pools' addresses, to use it in Quoter contract.
     */
    private getQuoterMethodsData(
        options: GetQuoterMethodsDataOptions,
        path: LiquidityPool[],
        lastTokenAddress: string,
        maxTransitPools: number
    ): { poolsPath: LiquidityPool[]; methodData: MethodData }[] {
        const { routesLiquidityPools, from, toToken } = options;

        if (path.length === maxTransitPools) {
            const pools = routesLiquidityPools.filter(pool =>
                pool.isPoolWithTokens(lastTokenAddress, toToken.address)
            );
            return pools.map(pool =>
                LiquidityPoolsController.getQuoterMethodData(path.concat(pool), from, toToken)
            );
        }

        return routesLiquidityPools
            .filter(pool => !path.includes(pool))
            .map(pool => {
                const methodsData: { poolsPath: LiquidityPool[]; methodData: MethodData }[] = [];
                if (compareAddresses(pool.token0.address, lastTokenAddress)) {
                    const extendedPath = path.concat(pool);
                    methodsData.push(
                        ...this.getQuoterMethodsData(
                            options,
                            extendedPath,
                            pool.token1.address,
                            maxTransitPools
                        )
                    );
                }
                if (compareAddresses(pool.token1.address, lastTokenAddress)) {
                    const extendedPath = path.concat(pool);
                    methodsData.push(
                        ...this.getQuoterMethodsData(
                            options,
                            extendedPath,
                            pool.token0.address,
                            maxTransitPools
                        )
                    );
                }
                return methodsData;
            })
            .flat();
    }
}
