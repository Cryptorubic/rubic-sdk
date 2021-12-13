import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity-error';
import { notNull } from '@common/utils/object';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { Injector } from '@core/sdk/injector';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import {
    UniswapCalculatedInfo,
    UniswapCalculatedInfoWithProfit
} from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-calculated-info';
import { UniswapRoute } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-route';
import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-trade-class';
import { UniswapV2AbstractTrade } from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';

export interface PathFactoryStruct {
    readonly from: PriceTokenAmount;
    readonly to: PriceToken;
    readonly exact: 'input' | 'output';
    readonly options: SwapCalculationOptions;
}

export interface UniswapV2AbstractProviderStruct<T extends UniswapV2AbstractTrade> {
    readonly InstantTradeClass: UniswapV2TradeClass<T>;
    readonly providerSettings: UniswapV2ProviderConfiguration;
}

export class PathFactory<T extends UniswapV2AbstractTrade> {
    private readonly web3Public: Web3Public;

    private readonly web3Private = Injector.web3Private;

    private readonly from: PriceTokenAmount;

    private readonly to: PriceToken;

    private readonly exact: 'input' | 'output';

    private readonly options: SwapCalculationOptions;

    private readonly InstantTradeClass: UniswapV2TradeClass<T>;

    private readonly routingProvidersAddresses: ReadonlyArray<string>;

    private readonly maxTransitTokens: number;

    private get walletAddress(): string | undefined {
        return this.web3Private.address;
    }

    constructor(
        uniswapProviderStruct: UniswapV2AbstractProviderStruct<T>,
        pathFactoryStruct: PathFactoryStruct
    ) {
        this.web3Public = Injector.web3PublicService.getWeb3Public(
            pathFactoryStruct.from.blockchain
        );

        this.from = pathFactoryStruct.from;
        this.to = pathFactoryStruct.to;
        this.exact = pathFactoryStruct.exact;
        this.options = pathFactoryStruct.options;
        this.InstantTradeClass = uniswapProviderStruct.InstantTradeClass;
        this.routingProvidersAddresses =
            uniswapProviderStruct.providerSettings.routingProvidersAddresses;
        this.maxTransitTokens = pathFactoryStruct.options.disableMultihops
            ? 0
            : uniswapProviderStruct.providerSettings.maxTransitTokens;
    }

    public async getAmountAndPath(
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const routes = (await this.getAllRoutes()).sort((a, b) =>
            b.outputAbsoluteAmount.gt(a.outputAbsoluteAmount) ? 1 : -1
        );
        if (routes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (this.options.gasCalculation === 'disabled') {
            return {
                route: routes[0]
            };
        }

        const gasRequests = routes.map(route => {
            const trade: UniswapV2AbstractTrade = new this.InstantTradeClass({
                from: this.from,
                to: new PriceTokenAmount({
                    ...this.to,
                    weiAmount: route.outputAbsoluteAmount,
                    price: new BigNumber(0)
                }),
                path: route.path,
                exact: this.exact,
                deadlineMinutes: this.options.deadlineMinutes,
                slippageTolerance: this.options.slippageTolerance
            });

            return trade.getEstimatedGasCallData();
        });

        const gasLimits = gasRequests.map(item => item.defaultGasLimit);

        if (this.walletAddress) {
            const estimatedGasLimits = await this.web3Public.batchEstimatedGas(
                this.InstantTradeClass.contractAbi,
                this.InstantTradeClass.getContractAddress(),
                this.walletAddress,
                gasRequests.map(item => item.callData)
            );
            estimatedGasLimits.forEach((elem, index) => {
                if (elem?.isFinite()) {
                    gasLimits[index] = elem;
                }
            });
        }

        if (
            this.options.gasCalculation === 'rubicOptimisation' &&
            this.to.price?.isFinite() &&
            gasPriceInUsd
        ) {
            const routesWithProfit: UniswapCalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const estimatedGas = gasLimits[index];
                    const gasFeeInUsd = estimatedGas.multipliedBy(gasPriceInUsd);
                    const profit = Web3Pure.fromWei(route.outputAbsoluteAmount, this.to.decimals)
                        .multipliedBy(this.to.price)
                        .multipliedBy(this.exact === 'input' ? 1 : -1)
                        .minus(gasFeeInUsd);

                    return {
                        route,
                        estimatedGas,
                        profit
                    };
                }
            );

            const sortedByProfitRoutes = routesWithProfit.sort((a, b) =>
                b.profit.minus(a.profit).gt(0) ? 1 : -1
            );

            return sortedByProfitRoutes[0];
        }

        return {
            route: routes[0],
            estimatedGas: gasLimits[0]
        };
    }

    private async getAllRoutes(): Promise<UniswapRoute[]> {
        const transitTokens = await Token.createTokens(
            this.routingProvidersAddresses,
            this.from.blockchain
        );

        const vertexes: Token[] = transitTokens.filter(
            elem => !elem.isEqualTo(this.from) && !elem.isEqualTo(this.to)
        );

        const initialPath = [this.from];
        const routesPaths: Token[][] = [];
        const routesMethodArguments: [string, string[]][] = [];

        const recGraphVisitor = (path: Token[], transitTokensLimit: number): void => {
            if (path.length === transitTokensLimit + 1) {
                const finalPath = path.concat(this.to);
                routesPaths.push(finalPath);
                routesMethodArguments.push([
                    this.from.stringWeiAmount,
                    Token.tokensToAddresses(finalPath)
                ]);
                return;
            }

            vertexes
                .filter(vertex => path.every(token => !token.isEqualTo(vertex)))
                .forEach(vertex => {
                    const extendedPath = path.concat(vertex);
                    recGraphVisitor(extendedPath, transitTokensLimit);
                });
        };

        for (let i = 0; i <= this.maxTransitTokens; i++) {
            recGraphVisitor(initialPath, i);
        }

        const responses = await this.InstantTradeClass.callForRoutes(
            this.from.blockchain,
            this.exact,
            routesMethodArguments
        );

        return responses
            .map((response, index) => {
                if (!response.success || !response.output) {
                    return null;
                }
                const { amounts } = response.output;
                const amount = new BigNumber(
                    this.exact === 'input' ? amounts[amounts.length - 1] : amounts[0]
                );
                return {
                    outputAbsoluteAmount: amount,
                    path: routesPaths[index]
                };
            })
            .filter(notNull);
    }
}
