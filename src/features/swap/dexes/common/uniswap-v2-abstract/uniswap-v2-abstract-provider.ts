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
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';

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
        return this.calculateDifficultTrade(from, to, from.tokenAmount, 'input', options);
    }

    public async calculateExactOutput(
        from: PriceToken,
        to: PriceTokenAmount,
        options?: SwapCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        return this.calculateDifficultTrade(from, to, to.tokenAmount, 'output', options);
    }

    public async calculateDifficultTrade(
        from: PriceToken,
        to: PriceToken,
        amount: BigNumber,
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
        if (fullOptions.gasCalculation !== 'disabled') {
            gasPriceInfo = await this.getGasPriceInfo();
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            amount,
            exact,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const amountAbsolute = new BigNumber(Web3Pure.toWei(amount));
        const fromAmount = exact === 'input' ? amountAbsolute : route.outputAbsoluteAmount;
        const toAmount = exact === 'output' ? amountAbsolute : route.outputAbsoluteAmount;

        const instantTrade: UniswapV2AbstractTrade = new this.InstantTradeClass({
            from: new PriceTokenAmount({ ...to.asStruct, weiAmount: fromAmount }),
            to: new PriceTokenAmount({ ...to.asStruct, weiAmount: toAmount }),
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
        from: PriceToken,
        to: PriceToken,
        amount: BigNumber,
        exact: 'input' | 'output',
        options: Required<SwapCalculationOptions>,
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, { from, to, amount, exact, options });
        return pathFactory.getAmountAndPath(gasPriceInUsd);
    }
}
