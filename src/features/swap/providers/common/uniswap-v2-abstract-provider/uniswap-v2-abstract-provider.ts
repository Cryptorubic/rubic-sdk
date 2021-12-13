import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-trade-class';
import { PathFactory } from '@features/swap/providers/common/uniswap-v2-abstract-provider/path-factory';
import { InstantTradeProvider } from '@features/swap/providers/instant-trade-provider';
import { UniswapV2AbstractTrade } from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { UniswapCalculatedInfo } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-calculated-info';
import { createTokenNativeAddressProxy } from '@features/swap/providers/common/utils/token-native-address-proxy';

export abstract class UniswapV2AbstractProvider<
    T extends UniswapV2AbstractTrade
> extends InstantTradeProvider {
    public abstract readonly InstantTradeClass: UniswapV2TradeClass<T>;

    public abstract readonly providerSettings: UniswapV2ProviderConfiguration;

    protected readonly defaultOptions: SwapCalculationOptions = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.02
    };

    protected readonly gasMargin = 1.2;

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: Partial<SwapCalculationOptions>
    ): Promise<UniswapV2AbstractTrade> {
        return this.calculateDifficultTrade(from, to, 'input', options);
    }

    public async calculateDifficultTrade(
        from: PriceTokenAmount,
        to: PriceToken,
        exact: 'input' | 'output',
        options?: Partial<SwapCalculationOptions>
    ): Promise<UniswapV2AbstractTrade> {
        const fullOptions: SwapCalculationOptions = { ...this.defaultOptions, ...options };

        const fromProxy = createTokenNativeAddressProxy(from, this.providerSettings.wethAddress);
        const toProxy = createTokenNativeAddressProxy(to, this.providerSettings.wethAddress);

        let gasPriceInfo: GasPriceInfo | undefined;
        if (fullOptions.gasCalculation !== 'disabled') {
            gasPriceInfo = await this.getGasPriceInfo();
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            exact,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const instantTrade: UniswapV2AbstractTrade = new this.InstantTradeClass({
            from,
            to: new PriceTokenAmount({ ...to.asStruct, weiAmount: route.outputAbsoluteAmount }),
            exact,
            path: route.path,
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
        from: PriceTokenAmount,
        to: PriceToken,
        exact: 'input' | 'output',
        options: SwapCalculationOptions,
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, { from, to, exact, options });
        return pathFactory.getAmountAndPath(gasPriceInUsd);
    }
}
