import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Cache } from 'src/common/utils/decorators';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';

import {
    UNICHAIN_UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
    UNICHAIN_UNISWAP_V3_QUOTER_V2_CONTRACT_ADDRESS
} from '../../../../unichain/uni-v3/constants/contract-addresses';
import { UNICHAIN_UNISWAP_V3_QUOTER_V2_CONTRACT_ABI } from '../../../../unichain/uni-v3/constants/quoter-v2-abi';
import { UniswapV3Route } from '../../models/uniswap-v3-route';
import { UniswapV3RouterConfiguration } from '../../models/uniswap-v3-router-configuration';
import { FeeAmount, LiquidityPool } from './models/liquidity-pool';
import { UniswapV3QuoterController } from './uniswap-v3-quoter-controller';

interface GetQuoterMethodsDataOptions {
    routesLiquidityPools: LiquidityPool[];
    from: Token;
    to: Token;
    exact: Exact;
    weiAmount: string;
    maxTransitTokens: number;
}

type AmountOutWei = string;

export class UnichainUniswapV3QuoterController extends UniswapV3QuoterController {
    protected readonly feeAmounts: FeeAmount[] = [500, 3000];

    constructor(
        blockchain: EvmBlockchainName,
        routerConfiguration: UniswapV3RouterConfiguration<string>
    ) {
        super(
            blockchain,
            routerConfiguration,
            UNICHAIN_UNISWAP_V3_QUOTER_V2_CONTRACT_ADDRESS,
            UNICHAIN_UNISWAP_V3_QUOTER_V2_CONTRACT_ABI,
            UNICHAIN_UNISWAP_V3_FACTORY_CONTRACT_ADDRESS
        );
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
        if (exact === 'output') {
            throw new RubicSdkError(
                'Exact "output" is not supported in UnichainUniswapV3QuoterController!'
            );
        }
        if (poolsPath.length === 1 && poolsPath?.[0]) {
            const sqrtPriceLimitX96 = 0;
            return {
                poolsPath,
                methodData: {
                    methodName: 'quoteExactInputSingle',
                    methodArguments: [
                        from.address,
                        to.address,
                        weiAmount,
                        poolsPath[0].fee,
                        sqrtPriceLimitX96
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

        const results = await this.web3Public.multicallContractMethods<AmountOutWei>(
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

        console.log('%cgetAllRoutes_Results ==> ', 'color: aqua; font-size: 20px;', results);
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
                UnichainUniswapV3QuoterController.getQuoterMethodData(
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
