import { GasPriceApi } from '@common/http/gas-price-api';
import { combineOptions } from '@common/utils/options';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { UniswapV2ProviderConfiguration } from '@features/swap/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@features/swap/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { PathFactory } from '@features/swap/dexes/common/uniswap-v2-abstract/path-factory';
import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { UniswapCalculatedInfo } from '@features/swap/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { createTokenNativeAddressProxy } from '@features/swap/dexes/common/utils/token-native-address-proxy';

export abstract class UniswapV2AbstractProvider<
    T extends UniswapV2AbstractTrade = UniswapV2AbstractTrade
> extends InstantTradeProvider {
    public abstract readonly InstantTradeClass: UniswapV2TradeClass<T>;

    public abstract readonly providerSettings: UniswapV2ProviderConfiguration;

    protected readonly defaultOptions: Required<SwapCalculationOptions> = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.02
    };

    protected readonly gasMargin = 1.2;

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options?: SwapCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        return this.calculateDifficultTrade(from, to, from.weiAmount, 'input', options);
    }

    public async calculateExactOutput(
        from: PriceToken,
        to: PriceTokenAmount,
        options?: SwapCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        return this.calculateDifficultTrade(from, to, to.weiAmount, 'output', options);
    }

    public async calculateDifficultTrade(
        from: PriceToken,
        to: PriceToken,
        weiAmount: BigNumber,
        exact: 'input' | 'output',
        options?: SwapCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        const fullOptions: Required<SwapCalculationOptions> = combineOptions(
            options,
            this.defaultOptions
        );

        const fromProxy = createTokenNativeAddressProxy(from, this.providerSettings.wethAddress);
        const toProxy = createTokenNativeAddressProxy(to, this.providerSettings.wethAddress);

        let gasPriceInfo: GasPriceInfo | undefined;
        if (
            fullOptions.gasCalculation !== 'disabled' &&
            GasPriceApi.isSupportedBlockchain(from.blockchain)
        ) {
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
            nativeSupportedPath: route.path,
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
        exact: 'input' | 'output',
        options: Required<SwapCalculationOptions>,
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, { from, to, weiAmount, exact, options });
        return pathFactory.getAmountAndPath(gasPriceInUsd);
    }
}
