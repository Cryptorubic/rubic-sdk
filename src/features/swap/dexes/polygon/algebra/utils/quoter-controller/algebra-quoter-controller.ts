import { BLOCKCHAIN_NAME, PriceToken, PriceTokenAmount } from 'src/core';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { AlgebraRoute } from '@features/swap/dexes/polygon/algebra/models/algebra-route';
import { compareAddresses, notNull } from 'src/common';
import BigNumber from 'bignumber.js';
import { ContractMulticallResponse } from '@core/blockchain/web3-public/models/contract-multicall-response';
import {
    QUOTER_CONTRACT_ABI,
    QUOTER_CONTRACT_ADDRESS
} from '@features/swap/dexes/polygon/algebra/utils/quoter-controller/constants/quoter-contract-data';
import { Injector } from '@core/sdk/injector';
import { ROUTER_TOKENS } from '@features/swap/dexes/polygon/algebra/utils/quoter-controller/constants/router-tokens';
import { Token } from '@core/blockchain/tokens/token';
import { UniswapV3AlgebraQuoterController } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';

interface GetQuoterMethodsDataOptions {
    routesTokens: Token[];
    toToken: Token;
    amountAbsolute: string;
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
     * @param amountAbsolute From or to amount.
     */
    private static getQuoterMethodData(
        path: Token[],
        amountAbsolute: string
    ): {
        path: Token[];
        methodData: MethodData;
    } {
        if (path.length === 2) {
            return {
                path,
                methodData: {
                    methodName: 'quoteExactInputSingle',
                    methodArguments: [path[0].address, path[1].address, amountAbsolute, 0]
                }
            };
        }

        return {
            path,
            methodData: {
                methodName: 'quoteExactInput',
                methodArguments: [AlgebraQuoterController.getEncodedPath(path), amountAbsolute]
            }
        };
    }

    private readonly web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.POLYGON);

    private async getRouterTokens(): Promise<Token[]> {
        if (!this.routerTokens) {
            this.routerTokens = await Token.createTokens(ROUTER_TOKENS, BLOCKCHAIN_NAME.POLYGON);
        }

        return this.routerTokens;
    }

    /**
     * Returns all routes between given tokens with output amount.
     * @param from From token.
     * @param toToken To token.
     * @param routeMaxTransitPools Max amount of transit pools.
     */
    public async getAllRoutes(
        from: PriceTokenAmount,
        toToken: PriceToken,
        routeMaxTransitPools: number
    ): Promise<AlgebraRoute[]> {
        const routesTokens = (await this.getRouterTokens()).filter(
            token =>
                !compareAddresses(token.address, from.address) &&
                !compareAddresses(token.address, toToken.address)
        );

        const options: Omit<GetQuoterMethodsDataOptions, 'maxTransitTokens'> = {
            routesTokens,
            toToken,
            amountAbsolute: from.stringWeiAmount
        };
        const quoterMethodsData = [...Array(routeMaxTransitPools + 1)]
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
        const { routesTokens, toToken, amountAbsolute, maxTransitTokens } = options;

        if (path.length === maxTransitTokens + 1) {
            return [
                AlgebraQuoterController.getQuoterMethodData(path.concat(toToken), amountAbsolute)
            ];
        }

        return routesTokens
            .filter(token => !path.includes(token))
            .map(token => this.getQuoterMethodsData(options, path.concat(token)))
            .flat();
    }
}
