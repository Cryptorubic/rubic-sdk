import { InsufficientLiquidityError } from '@rsdk-common/errors/swap/insufficient-liquidity.error';
import { notNull } from '@rsdk-common/utils/object';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { Token } from '@rsdk-core/blockchain/tokens/token';
import { BatchCall } from '@rsdk-core/blockchain/web3-public/models/batch-call';
import { Web3Public } from '@rsdk-core/blockchain/web3-public/web3-public';
import { Web3Pure } from '@rsdk-core/blockchain/web3-pure/web3-pure';
import { Injector } from '@rsdk-core/sdk/injector';
import { RequiredSwapCalculationOptions } from '@rsdk-features/instant-trades/models/swap-calculation-options';
import {
    UniswapCalculatedInfo,
    UniswapCalculatedInfoWithProfit
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { UniswapRoute } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-route';
import { UniswapV2ProviderConfiguration } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { UniswapV2AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { Cache } from '@rsdk-common/decorators/cache.decorator';
import { RubicSdkError } from 'src/common';
import { Exact } from '@rsdk-features/instant-trades/models/exact';
import { hasLengthAtLeast } from '@rsdk-features/instant-trades/utils/type-guards';

export interface PathFactoryStruct {
    readonly from: PriceToken;
    readonly to: PriceToken;
    readonly weiAmount: BigNumber;
    readonly exact: Exact;
    readonly options: RequiredSwapCalculationOptions;
}

export interface UniswapV2AbstractProviderStruct<T extends UniswapV2AbstractTrade> {
    readonly InstantTradeClass: UniswapV2TradeClass<T>;
    readonly providerSettings: UniswapV2ProviderConfiguration;
}

export class PathFactory<T extends UniswapV2AbstractTrade> {
    private readonly web3Public: Web3Public;

    private readonly from: PriceToken;

    private readonly to: PriceToken;

    private readonly weiAmount: BigNumber;

    private readonly exact: Exact;

    private readonly options: RequiredSwapCalculationOptions;

    private readonly InstantTradeClass: UniswapV2TradeClass<T>;

    private readonly routingProvidersAddresses: ReadonlyArray<string>;

    private readonly maxTransitTokens: number;

    private get walletAddress(): string | undefined {
        return Injector.web3Private.address;
    }

    @Cache
    private get stringWeiAmount(): string {
        return this.weiAmount.toFixed(0);
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
        this.weiAmount = pathFactoryStruct.weiAmount;
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
        const routes = (await this.getAllRoutes()).sort(
            (a, b) =>
                b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount) *
                (this.exact === 'input' ? 1 : -1)
        );
        if (routes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (this.options.gasCalculation === 'disabled') {
            if (!hasLengthAtLeast(routes, 1)) {
                throw new RubicSdkError('Routes array length has to be bigger than 0');
            }
            return {
                route: routes[0]
            };
        }

        if (
            this.options.gasCalculation === 'rubicOptimisation' &&
            this.to.price?.isFinite() &&
            gasPriceInUsd
        ) {
            const gasLimits = this.getDefaultGases(routes);

            if (this.walletAddress) {
                const estimatedGasLimits = await this.web3Public.batchEstimatedGas(
                    this.InstantTradeClass.contractAbi,
                    this.InstantTradeClass.getContractAddress(this.from.blockchain),
                    this.walletAddress,
                    this.getGasRequests(routes)
                );
                estimatedGasLimits.forEach((elem, index) => {
                    if (elem?.isFinite()) {
                        gasLimits[index] = elem;
                    }
                });
            }

            const routesWithProfit: UniswapCalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const estimatedGas = gasLimits[index];
                    if (!estimatedGas) {
                        throw new RubicSdkError('Estimated gas has to be defined');
                    }
                    const gasFeeInUsd = estimatedGas.multipliedBy(gasPriceInUsd);
                    let profit: BigNumber;
                    if (this.exact === 'input') {
                        profit = Web3Pure.fromWei(route.outputAbsoluteAmount, this.to.decimals)
                            .multipliedBy(this.to.price)
                            .minus(gasFeeInUsd);
                    } else {
                        profit = Web3Pure.fromWei(route.outputAbsoluteAmount, this.from.decimals)
                            .multipliedBy(this.from.price)
                            .multipliedBy(-1)
                            .minus(gasFeeInUsd);
                    }

                    return {
                        route,
                        estimatedGas,
                        profit
                    };
                }
            );

            const sortedByProfitRoutes = routesWithProfit.sort((a, b) =>
                b.profit.comparedTo(a.profit)
            );

            if (!sortedByProfitRoutes?.[0]) {
                throw new RubicSdkError('Profit routes array length has to be bigger than 0');
            }

            return sortedByProfitRoutes[0];
        }

        let gasLimit = this.getDefaultGases(routes.slice(0, 1))[0];

        if (this.walletAddress) {
            const callData = this.getGasRequests(routes.slice(0, 1))[0];
            if (!callData) {
                throw new RubicSdkError('Call data has to be defined');
            }
            const estimatedGas = await this.web3Public.getEstimatedGas(
                this.InstantTradeClass.contractAbi,
                this.InstantTradeClass.getContractAddress(this.from.blockchain),
                callData.contractMethod,
                callData.params,
                this.walletAddress,
                callData.value
            );
            if (estimatedGas?.isFinite()) {
                gasLimit = estimatedGas;
            }
        }

        if (!routes?.[0]) {
            throw new RubicSdkError('Routes length has to be bigger than 0');
        }

        return {
            route: routes[0],
            estimatedGas: gasLimit
        };
    }

    private getGasRequests(routes: UniswapRoute[]): BatchCall[] {
        return this.getTradesByRoutes(routes).map(trade => trade.getEstimatedGasCallData());
    }

    private getDefaultGases(routes: UniswapRoute[]): BigNumber[] {
        return this.getTradesByRoutes(routes).map(trade => trade.getDefaultEstimatedGas());
    }

    private getTradesByRoutes(routes: UniswapRoute[]): UniswapV2AbstractTrade[] {
        return routes.map(route => {
            const fromAmount = this.exact === 'input' ? this.weiAmount : route.outputAbsoluteAmount;
            const toAmount = this.exact === 'output' ? this.weiAmount : route.outputAbsoluteAmount;

            return new this.InstantTradeClass({
                from: new PriceTokenAmount({
                    ...this.from.asStruct,
                    weiAmount: fromAmount
                }),
                to: new PriceTokenAmount({
                    ...this.to.asStruct,
                    weiAmount: toAmount
                }),
                wrappedPath: route.path,
                exact: this.exact,
                deadlineMinutes: this.options.deadlineMinutes,
                slippageTolerance: this.options.slippageTolerance
            });
        });
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
                    this.stringWeiAmount,
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

        const tokens = responses.map((response, index) => {
            if (!response.success || !response.output) {
                return null;
            }
            const { amounts } = response.output;

            const numberAmount = this.exact === 'input' ? amounts[amounts.length - 1] : amounts[0];
            if (!numberAmount) {
                throw new RubicSdkError('Amount has to be defined');
            }
            const outputAbsoluteAmount = new BigNumber(numberAmount);

            const path = routesPaths?.[index];
            if (!path) {
                throw new RubicSdkError('Path has to be defined');
            }

            return { outputAbsoluteAmount, path };
        });

        return tokens.filter(notNull);
    }
}
