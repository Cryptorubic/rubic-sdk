import { notNull } from 'src/common/utils/object';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PriceToken, Token } from 'src/common/tokens';
import { UniswapV3AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';
import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';
import { ROUTER_TOKENS } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/utils/quoter-controller/constants/router-tokens';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-route';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/abstract/on-chain-trade/evm-on-chain-trade/models/exact';
import {
    ALGEBRA_QUOTER_CONTRACT_ABI,
    ALGEBRA_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/utils/quoter-controller/constants/quoter-contract-data';
import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';

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
export class AbstractAlgebraQuoterController implements UniswapV3AlgebraQuoterController {
    private routerTokens: Token[] | undefined;

    private readonly quoterContractABI: AbiItem[];

    private readonly quoterContractAddress: string;

    constructor(
        quoterContractABI: AbiItem[] = ALGEBRA_QUOTER_CONTRACT_ABI,
        quoterContractAddress: string = ALGEBRA_QUOTER_CONTRACT_ADDRESS
    ) {
        this.quoterContractABI = quoterContractABI;
        this.quoterContractAddress = quoterContractAddress;
    }

    /**
     * Converts algebra route to encoded bytes string to pass it to contract.
     * Structure of encoded string: '0x${tokenAddress_0}${tokenAddress_1}...${tokenAddress_n}.
     * @param path Symbol tokens, included in route.
     * @returns string Encoded string.
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
        if (path.length === 2 && path?.[0] && path?.[1]) {
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
                methodArguments: [
                    AbstractAlgebraQuoterController.getEncodedPath(tokensPath),
                    weiAmount
                ]
            }
        };
    }

    private get web3Public(): EvmWeb3Public {
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

        const results = await this.web3Public.multicallContractMethods<string>(
            this.quoterContractAddress,
            this.quoterContractABI,
            quoterMethodsData.map(quoterMethodData => quoterMethodData.methodData)
        );

        return results
            .map((result: ContractMulticallResponse<string>, index: number) => {
                if (result.success) {
                    const quoter = quoterMethodsData?.[index];
                    if (!quoter) {
                        throw new RubicSdkError('Quoter has to be defined');
                    }
                    return {
                        outputAbsoluteAmount: new BigNumber(result.output!),
                        path: quoter.path
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
            return [
                AbstractAlgebraQuoterController.getQuoterMethodData(
                    path.concat(to),
                    exact,
                    weiAmount
                )
            ];
        }

        return routesTokens
            .filter(token => !path.includes(token))
            .map(token => this.getQuoterMethodsData(options, path.concat(token)))
            .flat();
    }
}
