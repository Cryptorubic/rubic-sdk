import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { PriceToken, Web3Pure } from 'src/core';
import { SwapCalculationOptions } from 'src/features';
import { combineOptions } from '@common/utils/options';
import { createTokenNativeAddressProxy } from '@features/swap/dexes/common/utils/token-native-address-proxy';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import BigNumber from 'bignumber.js';
import {
    UniswapV3AlgebraCalculatedInfo,
    UniswapV3AlgebraCalculatedInfoWithProfit
} from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-calculated-info';
import { InsufficientLiquidityError } from 'src/common';
import { UniswapV3AbstractTrade } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3AlgebraQuoterController } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';
import { UniswapV3AlgebraProviderConfiguration } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { AlgebraTrade } from '@features/swap/dexes/polygon/algebra/algebra-trade';
import { UniswapV3TradeClass } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-class';
import { UniswapV3AlgebraTradeStruct } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { UniswapV3Route } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { AlgebraRoute } from '@features/swap/dexes/polygon/algebra/models/algebra-route';
import { GasPriceApi } from '@common/http/gas-price-api';

export abstract class UniswapV3AlgebraAbstractProvider extends InstantTradeProvider {
    protected abstract readonly InstantTradeClass:
        | UniswapV3TradeClass<UniswapV3AbstractTrade>
        | typeof AlgebraTrade;

    protected abstract readonly quoterController: UniswapV3AlgebraQuoterController;

    public abstract readonly providerConfiguration: UniswapV3AlgebraProviderConfiguration;

    protected readonly gasMargin = 1.2;

    protected readonly defaultOptions: Required<SwapCalculationOptions> = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.02
    };

    /**
     * True if class is instance of Uniswap-V3, false if of Algebra.
     */
    private get isUniswapV3(): boolean {
        return this instanceof UniswapV3AbstractTrade;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options?: SwapCalculationOptions
    ): Promise<UniswapV3AbstractTrade | AlgebraTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromClone = createTokenNativeAddressProxy(
            from,
            this.providerConfiguration.wethAddress
        );
        const toClone = createTokenNativeAddressProxy(
            toToken,
            this.providerConfiguration.wethAddress
        );

        let gasPriceInfo: GasPriceInfo | undefined;
        if (
            fullOptions.gasCalculation !== 'disabled' &&
            GasPriceApi.isSupportedBlockchain(from.blockchain)
        ) {
            gasPriceInfo = await this.getGasPriceInfo();
        }

        const { route, estimatedGas } = await this.getRoute(
            fromClone,
            toClone,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const tradeStruct = {
            from,
            to: new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: route.outputAbsoluteAmount
            }),
            slippageTolerance: fullOptions.slippageTolerance,
            deadlineMinutes: fullOptions.deadlineMinutes
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return this.createTradeInstance(tradeStruct, route);
        }

        const gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return this.createTradeInstance(
            {
                ...tradeStruct,
                gasFeeInfo
            },
            route
        );
    }

    private async getRoute(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: Required<SwapCalculationOptions>,
        gasPriceInUsd?: BigNumber
    ): Promise<UniswapV3AlgebraCalculatedInfo> {
        const routes = (
            await this.quoterController.getAllRoutes(
                from,
                toToken,
                options.disableMultihops ? 0 : this.providerConfiguration.maxTransitTokens
            )
        ).sort((a, b) => b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount));

        if (routes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (options.gasCalculation === 'disabled') {
            return {
                route: routes[0]
            };
        }

        if (
            !this.isUniswapV3 &&
            options.gasCalculation === 'rubicOptimisation' &&
            toToken.price?.isFinite() &&
            gasPriceInUsd
        ) {
            const estimatedGasLimits = await this.InstantTradeClass.estimateGasLimitForRoutes(
                from,
                toToken,
                options,
                routes
            );

            const calculatedProfits: UniswapV3AlgebraCalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const estimatedGas = estimatedGasLimits[index];
                    const gasFeeInUsd = gasPriceInUsd!.multipliedBy(estimatedGas);
                    const profit = Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
                        .multipliedBy(toToken.price)
                        .minus(gasFeeInUsd);
                    return {
                        route,
                        estimatedGas,
                        profit
                    };
                }
            );

            return calculatedProfits.sort((a, b) => b.profit.comparedTo(a.profit))[0];
        }

        const route = routes[0];
        const estimatedGas = await this.InstantTradeClass.estimateGasLimitForRoute(
            from,
            toToken,
            options,
            route
        );
        return {
            route,
            estimatedGas
        };
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStruct,
        route: UniswapV3Route | AlgebraRoute
    ): UniswapV3AbstractTrade | AlgebraTrade {
        if (this.InstantTradeClass === AlgebraTrade) {
            return new this.InstantTradeClass({
                ...tradeStruct,
                route: route as AlgebraRoute
            });
        }

        return new (this.InstantTradeClass as UniswapV3TradeClass<UniswapV3AbstractTrade>)({
            ...tradeStruct,
            route: route as UniswapV3Route
        });
    }
}
