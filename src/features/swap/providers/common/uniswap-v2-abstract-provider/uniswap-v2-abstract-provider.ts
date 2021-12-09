import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { FeeInfo } from '@features/swap/models/fee-info';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { UniswapCalculatedInfo } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-calculated-info';
import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-trade-class';
import { PathFactory } from '@features/swap/providers/common/uniswap-v2-abstract-provider/path-factory';
import { UniswapV2AbstractTrade } from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { SwapOptions } from 'src/features/swap/models/swap-options';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';

export abstract class UniswapV2AbstractProvider<T extends UniswapV2AbstractTrade> {
    public abstract InstantTradeClass: UniswapV2TradeClass<T>;

    public abstract readonly providerSettings: UniswapV2ProviderConfiguration;

    protected readonly defaultOptions: SwapOptions = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadline: 1200000, // 20 min
        slippageTolerance: 0.05
    };

    private readonly GAS_MARGIN = 1.2;

    private readonly web3PublicService = Injector.web3PublicService;

    private readonly coingeckoApi = Injector.coingeckoApi;

    public async calculateTrade(
        from: PriceTokenAmount,
        to: PriceToken,
        exact: 'input' | 'output',
        options?: SwapOptions
    ): Promise<UniswapV2AbstractTrade> {
        options = { ...this.defaultOptions, ...options };

        const fromProxy = this.createTokenWETHAbleProxy(from);
        const toProxy = this.createTokenWETHAbleProxy(to);

        let gasPriceInfo: Partial<GasPriceInfo> = {};
        if (options.gasCalculation !== 'disabled') {
            gasPriceInfo = await this.getGasInfo(from.blockchain);
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            exact,
            options,
            gasPriceInfo.gasPriceInUsd
        );

        const instantTrade: UniswapV2AbstractTrade = new this.InstantTradeClass({
            from,
            to: new PriceTokenAmount({ ...to.asStruct, weiAmount: route.outputAbsoluteAmount }),
            exact,
            path: route.path,
            deadlineMinutes: options.deadline,
            slippageTolerance: options.slippageTolerance
        });

        if (options.gasCalculation === 'disabled') {
            return instantTrade;
        }

        instantTrade.feeInfo = this.getFeeInfo(estimatedGas, gasPriceInfo);
        return instantTrade;
    }

    private async getAmountAndPath(
        from: PriceTokenAmount,
        to: PriceToken,
        exact: 'input' | 'output',
        options: SwapOptions,
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, { from, to, exact, options });
        return pathFactory.getAmountAndPath(gasPriceInUsd);
    }

    private createTokenWETHAbleProxy<T extends Token>(token: T): T {
        const wethAbleAddress = token.isNative ? this.providerSettings.wethAddress : token.address;
        return new Proxy<T>(token, {
            get: (target, key) => {
                if (!(key in target)) {
                    return undefined;
                }
                if (key === 'address') {
                    return wethAbleAddress;
                }
                return target[key as keyof T];
            }
        });
    }

    private async getGasInfo(blockchain: BLOCKCHAIN_NAME): Promise<GasPriceInfo> {
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
    ): FeeInfo {
        const gasLimit = estimatedGas
            ? Web3Pure.calculateGasMargin(estimatedGas, this.GAS_MARGIN)
            : undefined;

        if (!gasLimit) {
            return { gasPrice: gasInfo.gasPrice };
        }
        const gasFeeInEth = gasInfo.gasPriceInEth?.multipliedBy(gasLimit);
        const gasFeeInUsd = gasInfo.gasPriceInUsd?.multipliedBy(gasLimit);

        return {
            gasLimit: estimatedGas,
            gasPrice: gasInfo.gasPrice,
            gasFeeInEth,
            gasFeeInUsd
        };
    }
}
