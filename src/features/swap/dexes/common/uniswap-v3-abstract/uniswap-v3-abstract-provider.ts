import { SwapCalculationOptions, TradeType } from 'src/features';
import { PriceToken, Web3Pure } from 'src/core';
import { UniSwapV3Trade } from '@features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-trade';
import { combineOptions } from '@common/utils/options';
import { createTokenNativeAddressProxy } from '@features/swap/dexes/common/utils/token-native-address-proxy';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { UniswapV3QuoterController } from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import BigNumber from 'bignumber.js';
import {
    UniswapV3CalculatedInfo,
    UniswapV3CalculatedInfoWithProfit
} from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-calculated-info';
import { Cache, InsufficientLiquidityError } from 'src/common';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { UniswapV3AbstractTrade } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3TradeClass } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-class';
import { UniswapV3ProviderConfiguration } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-provider-configuration';
import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { UniswapV3RouterConfiguration } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';

const RUBIC_OPTIMIZATION_DISABLED = true;

export abstract class UniswapV3AbstractProvider<
    T extends UniswapV3AbstractTrade = UniswapV3AbstractTrade
> extends InstantTradeProvider {
    public abstract readonly InstantTradeClass: UniswapV3TradeClass<T>;

    protected readonly defaultOptions: Required<SwapCalculationOptions> = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.02
    };

    protected readonly gasMargin = 1.2;

    public abstract readonly providerConfiguration: UniswapV3ProviderConfiguration;

    public abstract readonly routerConfiguration: UniswapV3RouterConfiguration<string>;

    public get type(): TradeType {
        return this.InstantTradeClass.type;
    }

    @Cache
    private get quoterController(): UniswapV3QuoterController {
        return new UniswapV3QuoterController(this.blockchain, this.routerConfiguration);
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options?: SwapCalculationOptions
    ): Promise<T> {
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
        if (fullOptions.gasCalculation !== 'disabled') {
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
            deadlineMinutes: fullOptions.deadlineMinutes,
            route
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new this.InstantTradeClass(tradeStruct);
        }

        const gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return new this.InstantTradeClass({
            ...tradeStruct,
            gasFeeInfo
        });
    }

    /**
     * Returns most profitable route and estimated gas, if related option in {@param options} is set.
     * @param from From token and amount.
     * @param toToken To token.
     * @param options Swap options.
     * @param gasPriceInUsd Gas price in usd.
     */
    private async getRoute(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: Required<SwapCalculationOptions>,
        gasPriceInUsd?: BigNumber
    ): Promise<UniswapV3CalculatedInfo> {
        const routes = (
            await this.quoterController.getAllRoutes(
                from,
                toToken,
                options.disableMultihops ? 0 : this.providerConfiguration.maxTransitPools
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
            !RUBIC_OPTIMIZATION_DISABLED &&
            options.gasCalculation === 'rubicOptimisation' &&
            toToken.price
        ) {
            const estimatedGasLimits = await UniSwapV3Trade.estimateGasLimitForRoutes(
                from,
                toToken,
                options,
                routes
            );

            const calculatedProfits: UniswapV3CalculatedInfoWithProfit[] = routes.map(
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
        const estimatedGas = await UniSwapV3Trade.estimateGasLimitForRoute(
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
}
