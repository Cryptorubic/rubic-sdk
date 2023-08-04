import BigNumber from 'bignumber.js';
import { TokenInfoFormatted } from 'iziswap-sdk/lib/base/types';
import { getTokenChainPath } from 'iziswap-sdk/lib/base/utils';
import { InsufficientLiquidityError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { izumiQuoterContractAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/contracts/izumi-quoter-contract-abi';
import {
    IzumiPool,
    IzumiPoolResponse
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/models/izumi-pool-response';
import { UniswapRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-route';
import { hasLengthAtLeast } from 'src/features/on-chain/calculation-manager/utils/type-guards';

export class IzumiQuoterController {
    private readonly apiUrl = 'https://api.izumi.finance/api/v1/izi_swap';

    constructor(
        private readonly quoterAddress: string,
        private readonly blockchain: EvmBlockchainName,
        private readonly swapConfiguration: {
            readonly maxTransitTokens: number;
            readonly routingTokenAddresses: string[];
        }
    ) {}

    public async getAllRoutes(
        fromToken: PriceTokenAmount,
        toToken: PriceToken,
        options: OnChainCalculationOptions,
        fromAmount: string
    ): Promise<
        UniswapRoute & {
            readonly tokenChain: string[];
            readonly feeChain: number[];
        }
    > {
        const pools = await this.getAllPools();
        const routes = await this.getRelatedPools(fromToken, toToken, pools, fromAmount);

        const sortedRoutes = routes
            .filter(route => route.outputAbsoluteAmount.gt(0))
            .sort((a, b) => b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount));
        if (sortedRoutes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (options.gasCalculation === 'disabled') {
            if (!hasLengthAtLeast(sortedRoutes, 1)) {
                throw new RubicSdkError('Routes array length has to be bigger than 0');
            }
            return sortedRoutes[0];
        }

        const sortedByProfitRoutes = routes.sort((a, b) =>
            b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount)
        );

        if (!sortedByProfitRoutes?.[0]) {
            throw new RubicSdkError('Profit routes array length has to be bigger than 0');
        }

        return sortedByProfitRoutes[0];
    }

    private async getAllPools(): Promise<IzumiPool[]> {
        const chain = blockchainId[this.blockchain];
        const pageSize = 100;
        const pages = [1, 2, 3];

        const poolsPromises = pages.map(page =>
            Injector.httpClient.get<IzumiPoolResponse>(
                `${this.apiUrl}/summary_record/?page=${page}&page_size=${pageSize}&chain_id=${chain}&type=0`
            )
        );
        const poolsResult = await Promise.allSettled(poolsPromises);
        return poolsResult
            .filter(pools => pools.status === 'fulfilled')
            .flatMap(pool => {
                const sourcePools = (
                    pool as unknown as PromiseFulfilledResult<{ data: IzumiPool[] }>
                ).value.data;
                return sourcePools.map(sourcePool => ({
                    address: sourcePool.address,
                    tokenX: sourcePool.tokenX,
                    tokenX_address: sourcePool.tokenX_address,
                    tokenY: sourcePool.tokenY,
                    tokenY_address: sourcePool.tokenY_address,
                    fee: sourcePool.fee
                }));
            });
    }

    private async getRelatedPools(
        from: Token,
        to: Token,
        allPools: IzumiPool[],
        tokenAmount: string
    ): Promise<
        (UniswapRoute & {
            readonly tokenChain: string[];
            readonly feeChain: number[];
        })[]
    > {
        const transitTokens = await Token.createTokens(
            this.swapConfiguration.routingTokenAddresses,
            this.blockchain
        );

        const vertexes: Token[] = transitTokens.filter(
            elem => !elem.isEqualTo(from) && !elem.isEqualTo(to)
        );

        const initialPath = [from];
        const routesPaths: Token[][] = [];

        const recGraphVisitor = (path: Token[], transitTokensLimit: number): void => {
            if (path.length === transitTokensLimit + 1) {
                const finalPath = path.concat(to);
                routesPaths.push(finalPath);
                return;
            }

            vertexes
                .filter(vertex => path.every(token => !token.isEqualTo(vertex)))
                .forEach(vertex => {
                    const extendedPath = path.concat(vertex);
                    recGraphVisitor(extendedPath, transitTokensLimit);
                });
        };

        for (let i = 0; i <= this.swapConfiguration.maxTransitTokens; i++) {
            recGraphVisitor(initialPath, i);
        }

        const configs: { path: string[]; fee: (number | undefined)[] }[] = [];

        const routesMethodArguments = routesPaths.map(path => {
            const poolsData = [...path].slice(0, -1).map((tokenA, index) => {
                const tokenB = path[index + 1]!;
                return allPools.find(
                    pool =>
                        (compareAddresses(pool.tokenX_address, tokenA.address) &&
                            compareAddresses(pool.tokenY_address, tokenB.address)) ||
                        (compareAddresses(pool.tokenY_address, tokenA.address) &&
                            compareAddresses(pool.tokenX_address, tokenB.address))
                );
            });
            if (poolsData.some(data => !Boolean(data))) {
                return null;
            }
            const tokensPath = path.map(token => ({ address: token.address }));
            const fee = poolsData.map(pool => pool?.fee);
            configs.push({
                path: tokensPath.map(el => el.address),
                fee
            });
            const chainPath = getTokenChainPath(
                tokensPath as unknown as TokenInfoFormatted[],
                fee as unknown as number[]
            );
            return [tokenAmount, chainPath];
        });

        const truePaths = routesMethodArguments
            .map((el, index) => (el ? routesPaths[index] : null))
            .filter(Boolean) as unknown as Token<EvmBlockchainName>[][];
        const trueRoutesMethodArguments = routesMethodArguments.filter(
            Boolean
        ) as unknown as string[][];

        const responses = await this.callForRoutes(trueRoutesMethodArguments);
        const successResponses = responses.map((response, index) => {
            if (!response.success || !response.output) {
                return null;
            }

            const amount = response.output;
            if (!amount) {
                throw new RubicSdkError('Amount has to be defined');
            }

            const path = truePaths[index];
            if (!path) {
                throw new RubicSdkError('Path has to be defined');
            }

            const outputAbsoluteAmount = new BigNumber(amount);

            return {
                outputAbsoluteAmount,
                path,
                tokenChain: configs[index]!.path,
                feeChain: configs[index]!.fee as unknown as number[]
            };
        });

        return successResponses.filter(notNull);
    }

    private async callForRoutes(
        routesMethodArguments: string[][]
    ): Promise<ContractMulticallResponse<string>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);

        return web3Public.multicallContractMethod<string>(
            this.quoterAddress,
            izumiQuoterContractAbi,
            'swapAmount',
            routesMethodArguments
        );
    }
}
