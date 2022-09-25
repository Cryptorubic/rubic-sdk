import { UniswapV2TradeClass } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { UniswapV2ProviderConfiguration } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { PathFactory } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/path-factory';
import { CalculationOptions } from 'src/features/instant-trades/providers/models/calculation-options';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { InstantTradeProvider } from 'src/features/instant-trades/providers/dexes/abstract/instant-trade-provider/instant-trade-provider';
import { UniswapCalculatedInfo } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-calculated-info';
import { createTokenNativeAddressProxy } from 'src/features/instant-trades/providers/dexes/abstract/utils/token-native-address-proxy';
import { GasPriceInfo } from 'src/features/instant-trades/providers/dexes/abstract/models/gas-price-info';
import { combineOptions } from 'src/common/utils/options';
import { UniswapV2AbstractTrade } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { TradeType } from 'src/features/instant-trades/providers/models/trade-type';
import BigNumber from 'bignumber.js';
import { Exact } from 'src/features/instant-trades/providers/models/exact';
import { UniswapV2CalculationOptions } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-calculation-options';

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

    protected readonly defaultOptions: UniswapV2CalculationOptions = {
        slippageTolerance: 0.02,
        deadlineMinutes: 20,
        gasCalculation: 'calculate',
        disableMultihops: false
    };

    protected readonly gasMargin = 1.2;

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: CalculationOptions
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
        from: PriceToken<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        options?: CalculationOptions
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
        from: PriceToken<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        options?: CalculationOptions
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
        from: PriceToken<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        weiAmount: BigNumber,
        exact: Exact,
        options?: CalculationOptions
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
            from: new PriceTokenAmount({
                ...from.asStruct,
                weiAmount: fromAmount
            }),
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
        from: PriceToken<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        weiAmount: BigNumber,
        exact: Exact,
        options: UniswapV2CalculationOptions,
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, { from, to, weiAmount, exact, options });
        return pathFactory.getAmountAndPath(gasPriceInUsd);
    }
}
