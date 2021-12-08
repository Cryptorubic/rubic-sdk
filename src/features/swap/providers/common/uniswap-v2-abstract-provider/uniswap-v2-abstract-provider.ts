import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Injector } from '@core/sdk/injector';
import { GasInfo } from '@features/swap/models/gas-info';
import { UniswapCalculatedInfo } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-calculated-info';
import { UniswapV2ProviderConfiguration } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/uniswap-v2-trade-class';
import { PathFactory } from '@features/swap/providers/common/uniswap-v2-abstract-provider/path-factory';
import { UniswapV2AbstractTrade } from '@features/swap/trades/common/uniswap-v2/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { Web3Public } from 'src/core/blockchain/web3-public/web3-public';
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

    private readonly web3Private = Injector.web3Private;

    private readonly web3PublicService = Injector.web3PublicService;

    private readonly coingeckoApi = Injector.coingeckoApi;

    private get walletAddress(): string | undefined {
        return this.web3Private.address;
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

    private async getGasInfo(blockchain: BLOCKCHAIN_NAME): Promise<GasInfo> {
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

    public async calculateTrade(
        from: PriceTokenAmount,
        to: PriceToken,
        exact: 'input' | 'output',
        options?: SwapOptions
    ): Promise<UniswapV2AbstractTrade> {
        options = { ...this.defaultOptions, ...options };

        const fromProxy = this.createTokenWETHAbleProxy(from);
        const toProxy = this.createTokenWETHAbleProxy(to);

        let gasInfo: Partial<GasInfo> = {};
        if (options.gasCalculation !== 'disabled') {
            gasInfo = await this.getGasInfo(from.blockchain);
        }

        const { route, estimatedGas } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            exact,
            {
                ...options
            },
            gasInfo.gasPriceInUsd
        );

        const instantTrade: UniswapV2AbstractTrade = new this.InstantTradeClass({
            from,
            to: new PriceTokenAmount({ ...to.asStruct, weiAmount: route.outputAbsoluteAmount }),
            exact,
            path: route.path,
            gasInfo
        });

        if (!options.shouldCalculateGas) {
            return instantTrade;
        }

        const gasLimit = estimatedGas
            ? Web3Public.calculateGasMargin(estimatedGas, this.GAS_MARGIN)
            : null;
        const gasFeeInEth = gasPriceInEth && gasLimit ? gasPriceInEth.multipliedBy(gasLimit) : null;
        const gasFeeInUsd =
            gasPriceInEth && gasLimit ? gasPriceInUsd?.multipliedBy(gasLimit) : null;

        return {
            ...instantTrade,
            gasInfo: {
                gasLimit,
                gasPrice: gasPrice || null,
                gasFeeInUsd: gasFeeInUsd || null,
                gasFeeInEth
            }
        };
    }

    public async getAmountAndPath(
        from: PriceTokenAmount,
        to: PriceToken,
        exact: 'input' | 'output',
        options: SwapOptions,
        gasPriceInUsd: BigNumber | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, { from, to, exact, options });
        return pathFactory.getAmountAndPath(gasPriceInUsd);
    }
}
