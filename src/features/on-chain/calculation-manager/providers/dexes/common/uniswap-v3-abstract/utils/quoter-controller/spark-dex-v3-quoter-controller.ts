import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { AbiItem } from 'web3-utils';

import { UniswapV3RouterConfiguration } from '../../models/uniswap-v3-router-configuration';
import { LiquidityPool } from './models/liquidity-pool';
import { UniswapV3QuoterController } from './uniswap-v3-quoter-controller';

interface GetQuoterMethodsDataOptions {
    routesLiquidityPools: LiquidityPool[];
    from: Token;
    to: Token;
    exact: Exact;
    weiAmount: string;
    maxTransitTokens: number;
}

interface QuoteExactInputSingleParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    fee: number;
    sqrtPriceLimitX96: number;
}

export class SparkDexV3QuoterController extends UniswapV3QuoterController {
    constructor(
        blockchain: EvmBlockchainName,
        routerConfiguration: UniswapV3RouterConfiguration<string>,
        contractAddress: string,
        contractAbi: AbiItem[],
        factoryAddress?: string
    ) {
        super(blockchain, routerConfiguration, contractAddress, contractAbi, factoryAddress);
    }

    /**
     * Returns swap method's name and arguments to pass it to Quoter contract.
     * @param poolsPath Pools, included in the route.
     * @param from From token.
     * @param to To token.
     * @param exact Is exact input or output trade.
     * @param weiAmount Amount of tokens to trade.
     */
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
                    methodArguments: [
                        {
                            tokenIn: from.address,
                            tokenOut: to.address,
                            amountIn: weiAmount,
                            fee: poolsPath[0].fee,
                            sqrtPriceLimitX96
                        }
                    ] as QuoteExactInputSingleParams[]
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
                SparkDexV3QuoterController.getQuoterMethodData(
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