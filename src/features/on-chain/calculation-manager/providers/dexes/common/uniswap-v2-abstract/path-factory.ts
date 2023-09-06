import BigNumber from 'bignumber.js';
import { InsufficientLiquidityError, RubicSdkError } from 'src/common/errors';
import { PriceToken, Token } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { notNull } from 'src/common/utils/object';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { BatchCall } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/batch-call';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import {
    UniswapCalculatedInfo,
    UniswapCalculatedInfoWithProfit
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { UniswapRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-route';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';
import { hasLengthAtLeast } from 'src/features/on-chain/calculation-manager/utils/type-guards';

export interface PathFactoryStruct {
    readonly from: PriceToken<EvmBlockchainName>;
    readonly to: PriceToken<EvmBlockchainName>;
    readonly weiAmount: BigNumber;
    readonly exact: Exact;
    readonly options: UniswapV2CalculationOptions;
    readonly proxyFeeInfo: OnChainProxyFeeInfo | undefined;
}

export interface UniswapV2AbstractProviderStruct<T extends UniswapV2AbstractTrade> {
    readonly UniswapV2TradeClass: UniswapV2TradeClass<T>;
    readonly providerSettings: UniswapV2ProviderConfiguration;
}

export class PathFactory<T extends UniswapV2AbstractTrade> {
    private readonly web3Public: EvmWeb3Public;

    protected readonly from: PriceToken<EvmBlockchainName>;

    protected readonly to: PriceToken<EvmBlockchainName>;

    private readonly weiAmount: BigNumber;

    protected readonly exact: Exact;

    private readonly options: UniswapV2CalculationOptions;

    private readonly proxyFeeInfo: OnChainProxyFeeInfo | undefined;

    protected readonly UniswapV2TradeClass: UniswapV2TradeClass<T>;

    protected readonly routingProvidersAddresses: ReadonlyArray<string>;

    protected readonly maxTransitTokens: number;

    private get walletAddress(): string | undefined {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain).address;
    }

    @Cache
    protected get stringWeiAmount(): string {
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
        this.proxyFeeInfo = pathFactoryStruct.proxyFeeInfo;
    }

    public async getAmountAndPath(
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const allRoutes = await this.getAllRoutes();
        const sortedRoutes = allRoutes
            .filter(route => route.outputAbsoluteAmount.gt(0))
            .sort(
                (a, b) =>
                    b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount) *
                    (this.exact === 'input' ? 1 : -1)
            );
        if (sortedRoutes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (this.options.gasCalculation === 'disabled') {
            if (!hasLengthAtLeast(sortedRoutes, 1)) {
                throw new RubicSdkError('Routes array length has to be bigger than 0');
            }
            return {
                route: sortedRoutes[0]
            };
        }

        if (
            this.options.gasCalculation === 'rubicOptimisation' &&
            this.to.price?.isFinite() &&
            gasPriceInUsd
        ) {
            const gasLimits = this.getDefaultGases(sortedRoutes);

            if (this.walletAddress) {
                const gasRequests = await Promise.all(this.getGasRequests(sortedRoutes));
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

            const routesWithProfit: UniswapCalculatedInfoWithProfit[] = sortedRoutes.map(
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

        let gasLimit = this.getDefaultGases(sortedRoutes.slice(0, 1))[0];

        if (this.walletAddress) {
            const callData = await this.getGasRequests(sortedRoutes.slice(0, 1))[0];
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

        if (!sortedRoutes?.[0]) {
            throw new RubicSdkError('Routes length has to be bigger than 0');
        }

        return {
            route: sortedRoutes[0],
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
            const { from, to, fromWithoutFee } = getFromToTokensAmountsByExact(
                this.from,
                this.to,
                this.exact,
                this.weiAmount,
                this.weiAmount,
                route.outputAbsoluteAmount
            );

            return new this.UniswapV2TradeClass(
                {
                    from,
                    to,
                    path: route.path,
                    wrappedPath: route.path,
                    exact: this.exact,
                    deadlineMinutes: this.options.deadlineMinutes,
                    slippageTolerance: this.options.slippageTolerance,
                    gasFeeInfo: null,
                    useProxy: this.options.useProxy,
                    proxyFeeInfo: this.proxyFeeInfo,
                    fromWithoutFee,
                    withDeflation: { from: { isDeflation: false }, to: { isDeflation: false } }
                },
                EvmWeb3Pure.EMPTY_ADDRESS
            );
        });
    }

    protected async getAllRoutes(): Promise<UniswapRoute[]> {
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
