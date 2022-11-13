import { hasLengthAtLeast } from 'src/features/on-chain/calculation-manager/utils/type-guards';
import { UniswapV2TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BatchCall } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/batch-call';
import { InsufficientLiquidityError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import {
    UniswapCalculatedInfo,
    UniswapCalculatedInfoWithProfit
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { Injector } from 'src/core/injector/injector';
import { UniswapRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-route';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Cache } from 'src/common/utils/decorators';
import BigNumber from 'bignumber.js';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

export interface PathFactoryStruct {
    readonly from: PriceToken<EvmBlockchainName>;
    readonly to: PriceToken<EvmBlockchainName>;
    readonly weiAmount: BigNumber;
    readonly exact: Exact;
    readonly options: UniswapV2CalculationOptions;
}

export interface UniswapV2AbstractProviderStruct<T extends UniswapV2AbstractTrade> {
    readonly UniswapV2TradeClass: UniswapV2TradeClass<T>;
    readonly providerSettings: UniswapV2ProviderConfiguration;
}

export class PathFactory<T extends UniswapV2AbstractTrade> {
    private readonly web3Public: EvmWeb3Public;

    private readonly from: PriceToken<EvmBlockchainName>;

    private readonly to: PriceToken<EvmBlockchainName>;

    private readonly weiAmount: BigNumber;

    private readonly exact: Exact;

    private readonly options: UniswapV2CalculationOptions;

    private readonly UniswapV2TradeClass: UniswapV2TradeClass<T>;

    private readonly routingProvidersAddresses: ReadonlyArray<string>;

    private readonly maxTransitTokens: number;

    private get walletAddress(): string | undefined {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain).address;
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
        this.UniswapV2TradeClass = uniswapProviderStruct.UniswapV2TradeClass;
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
                const gasRequests = await Promise.all(this.getGasRequests(routes));
                const estimatedGasLimits = await this.web3Public.batchEstimatedGas(
                    this.walletAddress,
                    gasRequests
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
            const callData = await this.getGasRequests(routes.slice(0, 1))[0];
            if (!callData) {
                throw new RubicSdkError('Call data has to be defined');
            }
            const estimatedGas = (
                await this.web3Public.batchEstimatedGas(this.walletAddress, [callData])
            )[0];
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

    private getGasRequests(routes: UniswapRoute[]): Promise<BatchCall>[] {
        return this.getTradesByRoutes(routes).map(trade => trade.getEstimatedGasCallData());
    }

    private getDefaultGases(routes: UniswapRoute[]): BigNumber[] {
        return this.getTradesByRoutes(routes).map(trade => trade.getDefaultEstimatedGas());
    }

    private getTradesByRoutes(routes: UniswapRoute[]): UniswapV2AbstractTrade[] {
        return routes.map(route => {
            const fromAmount = this.exact === 'input' ? this.weiAmount : route.outputAbsoluteAmount;
            const toAmount = this.exact === 'output' ? this.weiAmount : route.outputAbsoluteAmount;

            return new this.UniswapV2TradeClass(
                {
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
                },
                this.options.useProxy,
                EvmWeb3Pure.EMPTY_ADDRESS
            );
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

        const responses = await this.UniswapV2TradeClass.callForRoutes(
            this.from.blockchain,
            this.exact,
            routesMethodArguments
        );

        const tokens = responses.map((response, index) => {
            if (!response.success || !response.output) {
                return null;
            }
            const amounts = response.output;

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
