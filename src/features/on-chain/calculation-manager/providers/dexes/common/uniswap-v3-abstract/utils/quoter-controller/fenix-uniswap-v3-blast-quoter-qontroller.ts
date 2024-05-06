import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Cache } from 'src/common/utils/decorators';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import {
    UNISWAP_V3_BLAST_FACTORY_CONTRACT_ABI,
    UNISWAP_V3_BLAST_FACTORY_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v3-blast/constants/factory-contract-data';
import {
    UNISWAP_V3_BLAST_QUOTER_CONTRACT_ABI,
    UNISWAP_V3_BLAST_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v3-blast/utils/quoter-controller/constants/quoter-contract-data';
import { UniswapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { UniswapV3RouterConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';
import {
    FeeAmount,
    LiquidityPool
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/models/liquidity-pool';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';

interface GetQuoterMethodsDataOptions {
    routesLiquidityPools: LiquidityPool[];
    from: Token;
    to: Token;
    exact: Exact;
    weiAmount: string;
    maxTransitTokens: number;
}

export class UniswapV3BlastQuoterController extends UniswapV3QuoterController {
    protected readonly feeAmounts: FeeAmount[] = [3000];

    constructor(
        blockchain: EvmBlockchainName,
        routerConfiguration: UniswapV3RouterConfiguration<string>
    ) {
        super(
            blockchain,
            routerConfiguration,
            UNISWAP_V3_BLAST_QUOTER_CONTRACT_ADDRESS,
            UNISWAP_V3_BLAST_QUOTER_CONTRACT_ABI,
            UNISWAP_V3_BLAST_FACTORY_CONTRACT_ADDRESS
        );
    }

    /**
     * Returns all liquidity pools, containing passed tokens addresses, and concatenates with most popular pools.
     */
    @Cache({
        maxAge: 1000 * 60 * 10
    })
    protected async getAllLiquidityPools(
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
                this.factoryAddress,
                UNISWAP_V3_BLAST_FACTORY_CONTRACT_ABI,
                'poolByPair',
                getPoolsMethodArguments.map(methodArguments => [
                    methodArguments.tokenA.address,
                    methodArguments.tokenB.address
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

    @Cache
    protected static getQuoterMethodData(
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
                    methodArguments: [from.address, to.address, weiAmount, sqrtPriceLimitX96]
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

        const results = await this.web3Public.multicallContractMethods<
            string | { returnedAmount: string }
        >(
            this.quoterContractAddress,
            this.quoterContractABI,
            quoterMethodsData.map(quoterMethodData => {
                if (quoterMethodData.methodData.methodName.toLowerCase().includes('single')) {
                    return {
                        methodName: quoterMethodData.methodData.methodName,
                        methodArguments: [quoterMethodData.methodData.methodArguments]
                    };
                }

                return quoterMethodData.methodData;
            })
        );

        return results
            .map((result, index) => {
                const pool = quoterMethodsData?.[index];
                if (!pool) {
                    throw new RubicSdkError('Pool has to be defined');
                }
                if (result.success) {
                    return {
                        outputAbsoluteAmount: new BigNumber(
                            result?.output! instanceof Object
                                ? result?.output?.returnedAmount
                                : result.output!
                        ),
                        poolsPath: pool.poolsPath,
                        initialTokenAddress: from.address
                    };
                }
                return null;
            })
            .filter(notNull);
    }

    /**
     * Returns swap methods' names and arguments, built with passed pools' addresses, to use it in Quoter contract.
     */
    protected getQuoterMethodsData(
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
                UniswapV3BlastQuoterController.getQuoterMethodData(
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
