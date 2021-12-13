import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-trade-class';
import { PathFactory } from '@features/swap/providers/common/uniswap-v2-abstract-provider/path-factory';
import { InstantTradeProvider } from '@features/swap/providers/instant-trade-provider';
import { UniswapV2AbstractTrade } from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { UniswapCalculatedInfo } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-calculated-info';
import { createTokenWethAbleProxy } from '@features/swap/providers/common/utils/weth';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';

export abstract class UniswapV2AbstractProvider<
    T extends UniswapV2AbstractTrade
> extends InstantTradeProvider {
    public abstract readonly InstantTradeClass: UniswapV2TradeClass<T>;

    public abstract readonly providerSettings: UniswapV2ProviderConfiguration;

    protected readonly defaultOptions: SwapCalculationOptions = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.05
    };

    private readonly GAS_MARGIN = 1.2;

    private readonly web3PublicService = Injector.web3PublicService;

    private readonly coingeckoApi = Injector.coingeckoApi;

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken
    ): Promise<UniswapV2AbstractTrade> {
        return this.calculateDifficultTrade(from, to, 'input');
    }

    public async calculateDifficultTrade(
        from: PriceTokenAmount,
        to: PriceToken,
        exact: 'input' | 'output',
        options?: Partial<SwapCalculationOptions>
    ): Promise<UniswapV2AbstractTrade> {
        const fullOptions: SwapCalculationOptions = { ...this.defaultOptions, ...options };

        const fromProxy = createTokenWethAbleProxy(from, this.providerSettings.wethAddress);
        const toProxy = createTokenWethAbleProxy(to, this.providerSettings.wethAddress);

        let gasPriceInfo: Partial<GasPriceInfo> = {};
        if (fullOptions.gasCalculation !== 'disabled') {
            gasPriceInfo = await this.getGasPriceInfo(from.blockchain);
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            exact,
            fullOptions,
            gasPriceInfo.gasPriceInUsd
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

        instantTrade.gasFeeInfo = this.getFeeInfo(estimatedGas, gasPriceInfo);
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

    private async getGasPriceInfo(blockchain: BLOCKCHAIN_NAME): Promise<GasPriceInfo> {
        const gasPrice = await this.web3PublicService.getWeb3Public(blockchain).getGasPrice();
        const gasPriceInEth = Web3Pure.fromWei(gasPrice);
        const nativeCoinPrice = await this.coingeckoApi.getNativeCoinPrice(blockchain);
        const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
        return {
            gasPrice: new BigNumber(gasPrice),
            gasPriceInEth,
            gasPriceInUsd
        };
    }

    private getFeeInfo(
        estimatedGas: BigNumber | undefined,
        gasInfo: Partial<GasPriceInfo>
    ): GasFeeInfo {
        const gasLimit = estimatedGas
            ? Web3Pure.calculateGasMargin(estimatedGas, this.GAS_MARGIN)
            : undefined;

        if (!gasLimit) {
            return { gasPrice: gasInfo.gasPrice };
        }
        const gasFeeInEth = gasInfo.gasPriceInEth?.multipliedBy(gasLimit);
        const gasFeeInUsd = gasInfo.gasPriceInUsd?.multipliedBy(gasLimit);

        return {
            gasLimit,
            gasPrice: gasInfo.gasPrice,
            gasFeeInEth,
            gasFeeInUsd
        };
    }
}
