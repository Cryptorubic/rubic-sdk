import BigNumber from 'bignumber.js';
import { InsufficientLiquidityError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { CamelotArbitrumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/camelot-arbitrum/camelot-arbitrum-trade';
import { BerachainTestnetAlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/berachain-testnet/berachain-testnet-algebra/berachain-testnet-algebra-trade';
import { BlastFenixTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/blast-fenix-trade';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/models/gas-price-info';
import { UniswapV3TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-class';
import {
    UniswapV3AlgebraCalculatedInfo,
    UniswapV3AlgebraCalculatedInfoWithProfit
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-calculated-info';
import { UniswapV3AlgebraCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-calculation-options';
import { UniswapV3AlgebraProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';
import { UniswapV3AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';
import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';
import { ModeAlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/algebra-mode/mode-algebra-trade';
import { AlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-trade';
import { QuickSwapV3Trade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/quick-swap-v3-trade';
import { QuickSwapV3PolygonZKEVMTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon-zkevm/quick-swap-v3/quick-swap-v3-trade';
import { UniSwapV3ScrollSepoliaTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v3-scroll-sepolia/uni-swap-v3-scroll-sepolia-trade';
import { AbiItem } from 'web3-utils';

import { AlgebraIntegralTrade } from '../../arthera-testnet/algebra-integral/algebra-integral-trade';
import { SparkDexV3FlareTrade } from '../../flare/spark-dex-flare/spark-dex-v3-flare/spark-dex-v3-flare-trade';
import { CamelotGravityTrade } from '../../gravity/camelot-gravity/camelot-gravity-trade';

export abstract class UniswapV3AlgebraAbstractProvider<
    T extends UniswapV3AlgebraAbstractTrade = UniswapV3AlgebraAbstractTrade
> extends EvmOnChainProvider {
    protected abstract readonly contractAbi: AbiItem[];

    protected abstract readonly contractAddress: string;

    protected abstract readonly OnChainTradeClass:
        | UniswapV3TradeClass<T>
        | typeof AlgebraTrade
        | typeof AlgebraIntegralTrade
        | typeof QuickSwapV3Trade
        | typeof QuickSwapV3PolygonZKEVMTrade
        | typeof CamelotArbitrumTrade
        | typeof UniSwapV3ScrollSepoliaTrade
        | typeof BerachainTestnetAlgebraTrade
        | typeof ModeAlgebraTrade
        | typeof BlastFenixTrade
        | typeof CamelotGravityTrade
        | typeof SparkDexV3FlareTrade;

    protected abstract readonly quoterController: UniswapV3AlgebraQuoterController;

    protected abstract readonly providerConfiguration: UniswapV3AlgebraProviderConfiguration;

    protected readonly isRubicOptimisationEnabled: boolean = false;

    protected readonly defaultOptions: UniswapV3AlgebraCalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    protected abstract createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3AlgebraRoute,
        providerAddress: string
    ): T;

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<T> {
        return this.calculateDifficultTrade(from, toToken, 'input', from.weiAmount, options);
    }

    /**
     * Calculates trade, based on amount, user wants to get.
     * @param fromToken Token to sell.
     * @param to Token to get with output amount.
     * @param options Additional options.
     */
    public async calculateExactOutput(
        fromToken: PriceToken<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<T> {
        return this.calculateDifficultTrade(fromToken, to, 'output', to.weiAmount, options);
    }

    /**
     * Calculates input amount, based on amount, user wants to get.
     * @param fromToken Token to sell.
     * @param to Token to get with output amount.
     * @param options Additional options.
     */
    public async calculateExactOutputAmount(
        fromToken: PriceToken<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<BigNumber> {
        return (await this.calculateExactOutput(fromToken, to, options)).from.tokenAmount;
    }

    protected async calculateDifficultTrade(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        exact: Exact,
        weiAmount: BigNumber,
        options?: OnChainCalculationOptions
    ): Promise<T> {
        const fullOptions = combineOptions(options, this.defaultOptions);

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

        const fromClone = createTokenNativeAddressProxy(
            fromToken,
            this.providerConfiguration.wethAddress
        );
        const toClone = createTokenNativeAddressProxy(
            toToken,
            this.providerConfiguration.wethAddress
        );

        let gasPriceInfo: GasPriceInfo | undefined;
        if (fullOptions.gasCalculation !== 'disabled') {
            try {
                gasPriceInfo = await this.getGasPriceInfo();
            } catch {}
        }

        const { route, estimatedGas } = await this.getRoute(
            fromClone,
            toClone,
            exact,
            weiAmountWithoutFee,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const { from, to, fromWithoutFee } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            weiAmountWithoutFee,
            route.outputAbsoluteAmount
        );

        const tradeStruct: UniswapV3AlgebraTradeStructOmitPath = {
            from,
            to,
            gasFeeInfo: null,
            exact,
            slippageTolerance: fullOptions.slippageTolerance,
            deadlineMinutes: fullOptions.deadlineMinutes,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return this.createTradeInstance(tradeStruct, route, fullOptions.providerAddress);
        }

        const gasFeeInfo = getGasFeeInfo(gasPriceInfo, { gasLimit: estimatedGas });

        return this.createTradeInstance(
            {
                ...tradeStruct,
                gasFeeInfo
            },
            route,
            fullOptions.providerAddress
        );
    }

    protected async getRoute(
        from: PriceToken<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        exact: Exact,
        weiAmount: BigNumber,
        options: UniswapV3AlgebraCalculationOptions,
        gasPriceInUsd?: BigNumber
    ): Promise<UniswapV3AlgebraCalculatedInfo> {
        const routes = (
            await this.quoterController.getAllRoutes(
                from,
                to,
                exact,
                weiAmount.toFixed(0),
                options.disableMultihops ? 0 : this.providerConfiguration.maxTransitTokens
            )
        ).sort(
            (a, b) =>
                b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount) *
                (exact === 'input' ? 1 : -1)
        );

        if (routes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (options.gasCalculation === 'disabled' && routes?.[0]) {
            return {
                route: routes[0]
            };
        }

        if (
            this.isRubicOptimisationEnabled &&
            options.gasCalculation === 'rubicOptimisation' &&
            to.price?.isFinite() &&
            gasPriceInUsd
        ) {
            const estimatedGasLimits = await this.OnChainTradeClass.estimateGasLimitForRoutes(
                from,
                to,
                exact,
                weiAmount,
                options,
                routes,
                this.createTradeInstance
            );

            const calculatedProfits: UniswapV3AlgebraCalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const estimatedGas = estimatedGasLimits[index];
                    if (!estimatedGas) {
                        throw new RubicSdkError('Estimated gas has have to be defined');
                    }
                    const gasFeeInUsd = gasPriceInUsd!.multipliedBy(estimatedGas);
                    const profit = Web3Pure.fromWei(route.outputAbsoluteAmount, to.decimals)
                        .multipliedBy(to.price)
                        .minus(gasFeeInUsd);

                    return {
                        route,
                        estimatedGas,
                        profit
                    };
                }
            );

            const bestRoute = calculatedProfits.sort((a, b) => b.profit.comparedTo(a.profit))[0];
            if (!bestRoute) {
                throw new RubicSdkError('bestRoute have to be defined');
            }

            return bestRoute;
        }

        const route = routes[0];
        if (!route) {
            throw new RubicSdkError('Route has to be defined');
        }

        return { route };
    }
}
