import { combineOptions } from '@rsdk-common/utils/options';
import { GasPriceInfo } from '@rsdk-features/instant-trades/models/gas-price-info';
import {
    RequiredSwapCalculationOptions,
    SwapCalculationOptions
} from '@rsdk-features/instant-trades/models/swap-calculation-options';
import { UniswapV2ProviderConfiguration } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { PathFactory } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/path-factory';
import { InstantTradeProvider } from '@rsdk-features/instant-trades/instant-trade-provider';
import { UniswapV2AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { UniswapCalculatedInfo } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { createTokenNativeAddressProxy } from '@rsdk-features/instant-trades/dexes/common/utils/token-native-address-proxy';
import { TradeType } from 'src/features';
import { Exact } from '@rsdk-features/instant-trades/models/exact';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';
import { PriceToken, PriceTokenAmount } from 'src/common';

export abstract class UniswapV2AbstractProvider<
    T extends UniswapV2AbstractTrade = UniswapV2AbstractTrade
> extends InstantTradeProvider {
    /** @internal */
    public abstract readonly InstantTradeClass: UniswapV2TradeClass<T>;

    /** @internal */
    public abstract readonly providerSettings: UniswapV2ProviderConfiguration;

    public get type(): TradeType {
        return this.InstantTradeClass.type;
    }

    protected readonly defaultOptions: RequiredSwapCalculationOptions = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.02,
        wrappedAddress: EMPTY_ADDRESS,
        fromAddress: ''
    };

    protected readonly gasMargin = 1.2;

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: SwapCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        return this.calculateDifficultTrade(from, to, from.weiAmount, 'input', options);
    }

    /**
     * Calculates trade, based on amount, user wants to get.
     * @param from Token to sell.
     * @param to Token to get with output amount.
     * @param options Additional options.
     */
    public async calculateExactOutput(
        from: PriceToken,
        to: PriceTokenAmount,
        options?: SwapCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        return this.calculateDifficultTrade(from, to, to.weiAmount, 'output', options);
    }

    /**
     * Calculates input amount, based on amount, user wants to get.
     * @param from Token to sell.
     * @param to Token to get with output amount.
     * @param options Additional options.
     */
    public async calculateExactOutputAmount(
        from: PriceToken,
        to: PriceTokenAmount,
        options?: SwapCalculationOptions
    ): Promise<BigNumber> {
        return (await this.calculateExactOutput(from, to, options)).from.tokenAmount;
    }

    /**
     * Calculates instant trade.
     * @param from Token to sell.
     * @param to Token to get.
     * @param weiAmount Amount to sell or to get in wei.
     * @param exact Defines, whether to call 'exactInput' or 'exactOutput' method.
     * @param options Additional options.
     */
    public async calculateDifficultTrade(
        from: PriceToken,
        to: PriceToken,
        weiAmount: BigNumber,
        exact: Exact,
        options?: SwapCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromProxy = createTokenNativeAddressProxy(from, this.providerSettings.wethAddress);
        const toProxy = createTokenNativeAddressProxy(to, this.providerSettings.wethAddress);

        let gasPriceInfo: GasPriceInfo | undefined;
        if (fullOptions.gasCalculation !== 'disabled') {
            gasPriceInfo = await this.getGasPriceInfo();
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            weiAmount,
            exact,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const fromAmount = exact === 'input' ? weiAmount : route.outputAbsoluteAmount;
        const toAmount = exact === 'output' ? weiAmount : route.outputAbsoluteAmount;

        const instantTrade: UniswapV2AbstractTrade = new this.InstantTradeClass({
            from: new PriceTokenAmount({ ...from.asStruct, weiAmount: fromAmount }),
            to: new PriceTokenAmount({ ...to.asStruct, weiAmount: toAmount }),
            exact,
            wrappedPath: route.path,
            deadlineMinutes: fullOptions.deadlineMinutes,
            slippageTolerance: fullOptions.slippageTolerance
        });

        if (fullOptions.gasCalculation === 'disabled') {
            return instantTrade;
        }

        instantTrade.gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return instantTrade;
    }

    private async getAmountAndPath(
        from: PriceToken,
        to: PriceToken,
        weiAmount: BigNumber,
        exact: Exact,
        options: RequiredSwapCalculationOptions,
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, { from, to, weiAmount, exact, options });
        return pathFactory.getAmountAndPath(gasPriceInUsd);
    }
}
