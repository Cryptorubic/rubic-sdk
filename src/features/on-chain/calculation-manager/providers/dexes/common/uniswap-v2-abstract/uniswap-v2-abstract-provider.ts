import { UniswapV2TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { PathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/path-factory';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { UniswapCalculatedInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/models/gas-price-info';
import { combineOptions } from 'src/common/utils/options';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import BigNumber from 'bignumber.js';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

export abstract class UniswapV2AbstractProvider<
    T extends UniswapV2AbstractTrade = UniswapV2AbstractTrade
> extends EvmOnChainProvider {
    /** @internal */
    public abstract readonly UniswapV2TradeClass: UniswapV2TradeClass<T>;

    /** @internal */
    public abstract readonly providerSettings: UniswapV2ProviderConfiguration;

    public get type(): OnChainTradeType {
        return this.UniswapV2TradeClass.type;
    }

    protected readonly defaultOptions: UniswapV2CalculationOptions = {
        slippageTolerance: 0.02,
        deadlineMinutes: 20,
        gasCalculation: 'calculate',
        disableMultihops: false,
        providerAddress: EvmWeb3Pure.EMPTY_ADDRESS
    };

    protected readonly gasMargin = 1.2;

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
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
        options?: OnChainCalculationOptions
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
        options?: OnChainCalculationOptions
    ): Promise<BigNumber> {
        return (await this.calculateExactOutput(from, to, options)).from.tokenAmount;
    }

    /**
     * Calculates on-chain trade.
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
        options?: OnChainCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        await this.checkContractState(from.blockchain);

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

        const uniswapV2Trade: UniswapV2AbstractTrade = new this.UniswapV2TradeClass(
            {
                from: new PriceTokenAmount({
                    ...from.asStruct,
                    weiAmount: fromAmount
                }),
                to: new PriceTokenAmount({ ...to.asStruct, weiAmount: toAmount }),
                exact,
                wrappedPath: route.path,
                deadlineMinutes: fullOptions.deadlineMinutes,
                slippageTolerance: fullOptions.slippageTolerance
            },
            fullOptions.providerAddress
        );

        if (fullOptions.gasCalculation === 'disabled') {
            return uniswapV2Trade;
        }

        uniswapV2Trade.gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return uniswapV2Trade;
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
