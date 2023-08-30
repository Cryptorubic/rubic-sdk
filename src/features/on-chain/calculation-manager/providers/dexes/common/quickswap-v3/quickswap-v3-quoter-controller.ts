import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, Token } from 'src/common/tokens';
import { notNull } from 'src/common/utils/object';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-route';

interface GetQuoterMethodsDataOptions {
    routesTokens: Token[];
    to: Token;
    exact: Exact;
    weiAmount: string;
    maxTransitTokens: number;
}

/**
 * Works with requests, related to Uniswap v3 liquidity pools.
 */
export class QuickswapV3QuoterController extends AlgebraQuoterController {
    public async getAllRoutes(
        from: PriceToken,
        to: PriceToken,
        exact: Exact,
        weiAmount: string,
        routeMaxTransitTokens: number
    ): Promise<AlgebraRoute[]> {
        const routesTokens = (await this.getOrCreateRouterTokens()).filter(
            token => !token.isEqualToTokens([from, to])
        );

        const options: Omit<GetQuoterMethodsDataOptions, 'maxTransitTokens'> = {
            routesTokens,
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
                    [from]
                )
            )
            .flat();

        try {
            const results = await Promise.allSettled<{ amountOut: string }>(
                quoterMethodsData.map(data =>
                    this.web3Public.callContractMethod<{ amountOut: string }>(
                        this.quoterContractAddress,
                        this.quoterContractABI,
                        data.methodData.methodName,
                        data.methodData.methodArguments
                    )
                )
            );

            return results
                .map((promiseResponce, index) => {
                    if (promiseResponce.status === 'fulfilled') {
                        const quoter = quoterMethodsData?.[index];
                        if (!quoter) {
                            throw new RubicSdkError('Quoter has to be defined');
                        }
                        return {
                            outputAbsoluteAmount: new BigNumber(promiseResponce.value.amountOut!),
                            path: quoter.path
                        };
                    }
                    return null;
                })
                .filter(notNull);
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}
