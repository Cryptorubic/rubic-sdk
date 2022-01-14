import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import {
    FeeAmount,
    LiquidityPool
} from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/models/liquidity-pool';
import { compareAddresses } from '@common/utils/blockchain';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import {
    FACTORY_CONTRACT_ABI,
    FACTORY_CONTRACT_ADDRESS
} from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/constants/factory-contract-data';
import { notNull } from '@common/utils/object';
import { UniswapV3Route } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { Token } from '@core/blockchain/tokens/token';
import { Cache } from '@common/decorators/cache.decorator';
import {
    QUOTER_CONTRACT_ABI,
    QUOTER_CONTRACT_ADDRESS
} from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/constants/quoter-contract-data';

import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Injector } from '@core/sdk/injector';
import { UniswapV3RouterConfiguration } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';
import { UniswapV3AlgebraQuoterController } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';

interface GetQuoterMethodsDataOptions {
    routesLiquidityPools: LiquidityPool[];
    from: PriceTokenAmount;
    toToken: Token;
    maxTransitTokens: number;
}

/**
 * Works with requests, related to Uniswap v3 liquidity pools.
 */
export class UniswapV3QuoterController implements UniswapV3AlgebraQuoterController {
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
                        from.stringWeiAmount,
                        0 // sqrtPriceLimitX96
                    ]
                }
            };
        }
        return {
            poolsPath,
            methodData: {
                methodName: 'quoteExactInput',
                methodArguments: [
                    UniswapV3QuoterController.getEncodedPoolsPath(poolsPath, from.address),
                    from.stringWeiAmount
                ]
            }
        };
    }

    private routerTokens: Token[] | undefined;

    private routerLiquidityPools: LiquidityPool[] | undefined;

    private readonly feeAmounts: FeeAmount[] = [500, 3000, 10000];

    private get web3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    constructor(
        private readonly blockchain: BLOCKCHAIN_NAME,
        private readonly routerConfiguration: UniswapV3RouterConfiguration<string>
    ) {}

    private async getOrCreateRouterTokensAndLiquidityPools(): Promise<{
        routerTokens: Token[];
        routerLiquidityPools: LiquidityPool[];
    }> {
        if (!this.routerTokens || !this.routerLiquidityPools) {
            const tokens: Token[] = await Token.createTokens(
                Object.values(this.routerConfiguration.tokens),
                this.blockchain
            );
            const liquidityPools: LiquidityPool[] = this.routerConfiguration.liquidityPools.map(
                liquidityPool => {
                    const tokenA = tokens.find(
                        token => token.symbol === liquidityPool.tokenSymbolA
                    )!;
                    const tokenB = tokens.find(
                        token => token.symbol === liquidityPool.tokenSymbolB
                    )!;
                    return new LiquidityPool(
                        liquidityPool.poolAddress,
                        tokenA,
                        tokenB,
                        liquidityPool.fee
                    );
                }
            );

            this.routerTokens = tokens;
            this.routerLiquidityPools = liquidityPools;
        }

        return {
            routerTokens: this.routerTokens,
            routerLiquidityPools: this.routerLiquidityPools
        };
    }

    /**
     * Returns all liquidity pools, containing passed tokens addresses, and concatenates with most popular pools.
     */
    @Cache({
        maxAge: 1000 * 60 * 10
    })
    private async getAllLiquidityPools(
        firstToken: Token,
        secondToken: Token
    ): Promise<LiquidityPool[]> {
        const { routerTokens, routerLiquidityPools } =
            await this.getOrCreateRouterTokensAndLiquidityPools();

        let getPoolsMethodArguments: { tokenA: Token; tokenB: Token; fee: FeeAmount }[] = [];
        getPoolsMethodArguments.push(
            ...Object.values(routerTokens)
                .filter(
                    routerToken =>
                        !routerToken.isEqualTo(firstToken) && !routerToken.isEqualTo(secondToken)
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
        getPoolsMethodArguments.push(
            ...this.feeAmounts.map(fee => ({
                tokenA: firstToken,
                tokenB: secondToken,
                fee
            }))
        );
        getPoolsMethodArguments = getPoolsMethodArguments.filter(
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
            await this.web3Public.multicallContractMethod<{ 0: string }>(
                FACTORY_CONTRACT_ADDRESS,
                FACTORY_CONTRACT_ABI,
                'getPool',
                getPoolsMethodArguments.map(methodArguments => [
                    methodArguments.tokenA.address,
                    methodArguments.tokenB.address,
                    methodArguments.fee
                ])
            )
        ).map(result => result.output![0]);

        return poolsAddresses
            .map((poolAddress, index) => {
                if (!Web3Pure.isZeroAddress(poolAddress)) {
                    return new LiquidityPool(
                        poolAddress,
                        getPoolsMethodArguments[index].tokenA,
                        getPoolsMethodArguments[index].tokenB,
                        getPoolsMethodArguments[index].fee
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
     * @param routeMaxTransitTokens Max amount of transit tokens.
     */
    public async getAllRoutes(
        from: PriceTokenAmount,
        toToken: PriceToken,
        routeMaxTransitTokens: number
    ): Promise<UniswapV3Route[]> {
        const routesLiquidityPools = await this.getAllLiquidityPools(from, toToken);
        const options: Omit<GetQuoterMethodsDataOptions, 'maxTransitTokens'> = {
            routesLiquidityPools,
            from,
            toToken
        };
        const quoterMethodsData = [...Array(routeMaxTransitTokens + 1)]
            .map((_, maxTransitTokens) =>
                this.getQuoterMethodsData(
                    {
                        ...options,
                        maxTransitTokens
                    },
                    [],
                    from.address
                )
            )
            .flat();

        return this.web3Public
            .multicallContractMethods<{ 0: string }>(
                QUOTER_CONTRACT_ADDRESS,
                QUOTER_CONTRACT_ABI,
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
        lastTokenAddress: string
    ): { poolsPath: LiquidityPool[]; methodData: MethodData }[] {
        const { routesLiquidityPools, from, toToken, maxTransitTokens } = options;

        if (path.length === maxTransitTokens) {
            const pools = routesLiquidityPools.filter(pool =>
                pool.isPoolWithTokens(lastTokenAddress, toToken.address)
            );
            return pools.map(pool =>
                UniswapV3QuoterController.getQuoterMethodData(path.concat(pool), from, toToken)
            );
        }

        return routesLiquidityPools
            .filter(pool => !path.includes(pool))
            .map(pool => {
                const methodsData: { poolsPath: LiquidityPool[]; methodData: MethodData }[] = [];
                if (compareAddresses(pool.token0.address, lastTokenAddress)) {
                    const extendedPath = path.concat(pool);
                    methodsData.push(
                        ...this.getQuoterMethodsData(options, extendedPath, pool.token1.address)
                    );
                }
                if (compareAddresses(pool.token1.address, lastTokenAddress)) {
                    const extendedPath = path.concat(pool);
                    methodsData.push(
                        ...this.getQuoterMethodsData(options, extendedPath, pool.token0.address)
                    );
                }
                return methodsData;
            })
            .flat();
    }
}
