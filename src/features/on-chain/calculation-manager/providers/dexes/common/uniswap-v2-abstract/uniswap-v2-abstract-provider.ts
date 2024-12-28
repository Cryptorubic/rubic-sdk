import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import {
    createTokenNativeAddressProxy,
    createTokenNativeAddressProxyInPathStartAndEnd
} from 'src/features/common/utils/token-native-address-proxy';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { UniswapCalculatedInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { UniswapV2TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-class';
import { UniswapV2TradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-struct';
import { PathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/path-factory';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';

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
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

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
     * @param fromToken Token to sell.
     * @param toToken Token to get.
     * @param weiAmount Amount to sell or to get in wei.
     * @param exact Defines, whether to call 'exactInput' or 'exactOutput' method.
     * @param options Additional options.
     */
    public async calculateDifficultTrade(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        weiAmount: BigNumber,
        exact: Exact,
        options?: OnChainCalculationOptions
    ): Promise<UniswapV2AbstractTrade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        if (fromToken.blockchain === BLOCKCHAIN_NAME.METIS && fromToken.isNative) {
            fromToken = new PriceToken({
                ...fromToken.asStruct,
                address: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
            });
        }

        if (toToken.blockchain === BLOCKCHAIN_NAME.METIS && toToken.isNative) {
            toToken = new PriceToken({
                ...toToken.asStruct,
                address: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
            });
        }

        let weiAmountWithoutFee = weiAmount;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...fromToken.asStruct,
                    weiAmount
                }),
                fullOptions
            );
            weiAmountWithoutFee = proxyContractInfo.fromWithoutFee.weiAmount;
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
        }

        const fromProxy = createTokenNativeAddressProxy(
            fromToken,
            this.providerSettings.wethAddress
        );
        const toProxy = createTokenNativeAddressProxy(toToken, this.providerSettings.wethAddress);

        const { route } = await this.getAmountAndPath(
            fromProxy,
            toProxy,
            weiAmountWithoutFee,
            exact,
            fullOptions,
            proxyFeeInfo
        );

        const { from, to, fromWithoutFee } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            weiAmountWithoutFee,
            route.outputAbsoluteAmount
        );

        const wrappedPath = route.path;
        const routPoolInfo = route?.routPoolInfo;
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            wrappedPath,
            EvmWeb3Pure.nativeTokenAddress
        );
        const tradeStruct: UniswapV2TradeStruct = {
            from,
            to,
            exact,
            path,
            routPoolInfo,
            wrappedPath,
            deadlineMinutes: fullOptions.deadlineMinutes,
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain
        };

        return new this.UniswapV2TradeClass(tradeStruct, fullOptions.providerAddress);
    }

    protected async getAmountAndPath(
        from: PriceToken<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        weiAmount: BigNumber,
        exact: Exact,
        options: UniswapV2CalculationOptions,
        proxyFeeInfo: OnChainProxyFeeInfo | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new PathFactory(this, {
            from,
            to,
            weiAmount,
            exact,
            options,
            proxyFeeInfo
        });
        return pathFactory.getAmountAndPath();
    }
}
