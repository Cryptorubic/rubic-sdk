import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Cache } from 'src/common/utils/decorators/cache-decorator/cache.decorator';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { UniswapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { UniswapV3RouterConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';
import {
    FACTORY_CONTRACT_ABI,
    FACTORY_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/constants/factory-contract-data';
import {
    UNISWAP_V3_QUOTER_CONTRACT_ABI,
    UNISWAP_V3_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/constants/quoter-contract-data';
import {
    FeeAmount,
    LiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/models/liquidity-pool';
import { UniswapV3AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';

interface GetQuoterMethodsDataOptions {
    routesLiquidityPools: LiquidityPool[];
    from: Token;
    to: Token;
    exact: Exact;
    weiAmount: string;
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
     * @returns string Encoded string.
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
     * @param from From token.
     * @param to To token.
     * @param exact Is exact input or output trade.
     * @param weiAmount Amount of tokens to trade.
     */
    @Cache
    private static getQuoterMethodData(
        poolsPath: LiquidityPool[],
        from: Token,
        to: Token,
        exact: Exact,
        weiAmount: string
    ): {
        poolsPath: LiquidityPool[];
        methodData: MethodData;
    } {
        if (poolsPath.length === 1 && poolsPath?.[0]) {
            const methodName =
                exact === 'input' ? 'quoteExactInputSingle' : 'quoteExactOutputSingle';
            const sqrtPriceLimitX96 = 0;
            return {
                poolsPath,
                methodData: {
                    methodName,
                    methodArguments: [
                        from.address,
                        to.address,
                        poolsPath[0].fee,
                        weiAmount,
                        sqrtPriceLimitX96
                    ]
                }
            };
        }

        const methodName = exact === 'input' ? 'quoteExactInput' : 'quoteExactOutput';
        const tokensPath = exact === 'input' ? poolsPath : poolsPath.reverse();
        const initialTokenAddress = exact === 'input' ? from.address : to.address;
        return {
            poolsPath,
            methodData: {
                methodName,
                methodArguments: [
                    UniswapV3QuoterController.getEncodedPoolsPath(tokensPath, initialTokenAddress),
                    weiAmount
                ]
            }
        };
    }

    private routerTokens: Token[] | undefined;

    private routerLiquidityPools: LiquidityPool[] | undefined;

    private readonly feeAmounts: FeeAmount[] = [500, 3000, 10000];

    private get web3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.blockchain);
    }

    constructor(
        private readonly blockchain: EvmBlockchainName,
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
                .filter(routerToken => !routerToken.isEqualToTokens([firstToken, secondToken]))
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
            await this.web3Public.multicallContractMethod<string>(
                FACTORY_CONTRACT_ADDRESS,
                FACTORY_CONTRACT_ABI,
                'getPool',
                getPoolsMethodArguments.map(methodArguments => [
                    methodArguments.tokenA.address,
                    methodArguments.tokenB.address,
                    methodArguments.fee
                ])
            )
        ).map(result => result.output!);

        return poolsAddresses
            .map((poolAddress, index) => {
                const poolMethodArguments = getPoolsMethodArguments?.[index];
                if (!poolMethodArguments) {
                    throw new RubicSdkError('Method arguments array for pool has to be defined');
                }
                if (!EvmWeb3Pure.isEmptyAddress(poolAddress)) {
                    return new LiquidityPool(
                        poolAddress,
                        poolMethodArguments.tokenA,
                        poolMethodArguments.tokenB,
                        poolMethodArguments.fee
                    );
                }
                return null;
            })
            .filter(notNull)
            .concat(routerLiquidityPools);
    }

    public async getAllRoutes(
        from: Token,
        to: Token,
        exact: Exact,
        weiAmount: string,
        routeMaxTransitTokens: number
    ): Promise<UniswapV3Route[]> {
        const routesLiquidityPools = await this.getAllLiquidityPools(from, to);
        const options: Omit<GetQuoterMethodsDataOptions, 'maxTransitTokens'> = {
            routesLiquidityPools,
            from,
            to,
            exact,
            weiAmount
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
            .multicallContractMethods<string>(
                UNISWAP_V3_QUOTER_CONTRACT_ADDRESS,
                UNISWAP_V3_QUOTER_CONTRACT_ABI,
                quoterMethodsData.map(quoterMethodData => quoterMethodData.methodData)
            )
            .then(results => {
                return results
                    .map((result, index) => {
                        const pool = quoterMethodsData?.[index];
                        if (!pool) {
                            throw new RubicSdkError('Pool has to be defined');
                        }
                        if (result.success) {
                            return {
                                outputAbsoluteAmount: new BigNumber(result.output!),
                                poolsPath: pool.poolsPath,
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
        const { routesLiquidityPools, from, to, exact, weiAmount, maxTransitTokens } = options;

        if (path.length === maxTransitTokens) {
            const pools = routesLiquidityPools.filter(pool =>
                pool.isPoolWithTokens(lastTokenAddress, to.address)
            );
            return pools.map(pool =>
                UniswapV3QuoterController.getQuoterMethodData(
                    path.concat(pool),
                    from,
                    to,
                    exact,
                    weiAmount
                )
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
