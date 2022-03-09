import { BLOCKCHAIN_NAME, PriceToken, Web3Public } from 'src/core';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { AlgebraRoute } from '@features/instant-trades/dexes/polygon/algebra/models/algebra-route';
import { notNull } from 'src/common';
import BigNumber from 'bignumber.js';
import { ContractMulticallResponse } from '@core/blockchain/web3-public/models/contract-multicall-response';
import {
    QUOTER_CONTRACT_ABI,
    QUOTER_CONTRACT_ADDRESS
} from '@features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/constants/quoter-contract-data';
import { Injector } from '@core/sdk/injector';
import { ROUTER_TOKENS } from '@features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/constants/router-tokens';
import { Token } from '@core/blockchain/tokens/token';
import { UniswapV3AlgebraQuoterController } from '@features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';
import { Exact } from '@features/instant-trades/models/exact';

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
export class AlgebraQuoterController implements UniswapV3AlgebraQuoterController {
    private routerTokens: Token[] | undefined;

    /**
     * Converts algebra route to encoded bytes string to pass it to contract.
     * Structure of encoded string: '0x${tokenAddress_0}${tokenAddress_1}...${tokenAddress_n}.
     * @param path Symbol tokens, included in route.
     * @return string Encoded string.
     */
    public static getEncodedPath(path: Token[]): string {
        const encodedPath = path.reduce(
            (accEncodedPath, token) => accEncodedPath + token.address.slice(2).toLowerCase(),
            ''
        );
        return `0x${encodedPath}`;
    }

    /**
     * Returns swap method's name and arguments to pass it to Quoter contract.
     * @param path Pools, included in route.
     * @param exact Is exact input or output trade.
     * @param weiAmount Amount of tokens to trade.
     */
    private static getQuoterMethodData(
        path: Token[],
        exact: Exact,
        weiAmount: string
    ): {
        path: Token[];
        methodData: MethodData;
    } {
        if (path.length === 2) {
            const methodName =
                exact === 'input' ? 'quoteExactInputSingle' : 'quoteExactOutputSingle';
            const limitSqrtPrice = 0;
            return {
                path,
                methodData: {
                    methodName,
                    methodArguments: [path[0].address, path[1].address, weiAmount, limitSqrtPrice]
                }
            };
        }

        const methodName = exact === 'input' ? 'quoteExactInput' : 'quoteExactOutput';
        const tokensPath = exact === 'input' ? path : path.reverse();
        return {
            path,
            methodData: {
                methodName,
                methodArguments: [AlgebraQuoterController.getEncodedPath(tokensPath), weiAmount]
            }
        };
    }

    private get web3Public(): Web3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.POLYGON);
    }

    private async getOrCreateRouterTokens(): Promise<Token[]> {
        if (!this.routerTokens) {
            this.routerTokens = await Token.createTokens(ROUTER_TOKENS, BLOCKCHAIN_NAME.POLYGON);
        }

        return this.routerTokens;
    }

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

        const results = await this.web3Public.multicallContractMethods<{ 0: string }>(
            QUOTER_CONTRACT_ADDRESS,
            QUOTER_CONTRACT_ABI,
            quoterMethodsData.map(quoterMethodData => quoterMethodData.methodData)
        );

        return results
            .map((result: ContractMulticallResponse<{ 0: string }>, index: number) => {
                if (result.success) {
                    return {
                        outputAbsoluteAmount: new BigNumber(result.output![0]),
                        path: quoterMethodsData[index].path
                    };
                }
                return null;
            })
            .filter(notNull);
    }

    /**
     * Returns swap methods' names and arguments, built with passed pools' addresses, to use it in Quoter contract.
     */
    private getQuoterMethodsData(
        options: GetQuoterMethodsDataOptions,
        path: Token[]
    ): { path: Token[]; methodData: MethodData }[] {
        const { routesTokens, to, exact, weiAmount, maxTransitTokens } = options;

        if (path.length === maxTransitTokens + 1) {
            return [AlgebraQuoterController.getQuoterMethodData(path.concat(to), exact, weiAmount)];
        }

        return routesTokens
            .filter(token => !path.includes(token))
            .map(token => this.getQuoterMethodsData(options, path.concat(token)))
            .flat();
    }
}
