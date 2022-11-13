import {
    UniswapV3AlgebraCalculatedInfo,
    UniswapV3AlgebraCalculatedInfoWithProfit
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-calculated-info';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV3TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-class';
import {
    UniswapV3AlgebraAbstractTrade,
    UniswapV3AlgebraTradeStruct
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { AlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-trade';
import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import { UniswapV3AlgebraProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-provider-configuration';
import { InsufficientLiquidityError, RubicSdkError } from 'src/common/errors';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { AbiItem } from 'web3-utils';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { UniswapV3AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-quoter-controller';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/models/gas-price-info';
import { combineOptions } from 'src/common/utils/options';
import BigNumber from 'bignumber.js';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { UniswapV3AlgebraCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-calculation-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { QuickSwapV3Trade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/quick-swap-v3-trade';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

export abstract class UniswapV3AlgebraAbstractProvider<
    T extends UniswapV3AlgebraAbstractTrade = UniswapV3AlgebraAbstractTrade
> extends EvmOnChainProvider {
    protected abstract readonly contractAbi: AbiItem[];

    protected abstract readonly contractAddress: string;

    protected abstract readonly OnChainTradeClass:
        | UniswapV3TradeClass<T>
        | typeof AlgebraTrade
        | typeof QuickSwapV3Trade;

    protected abstract readonly quoterController: UniswapV3AlgebraQuoterController;

    protected abstract readonly providerConfiguration: UniswapV3AlgebraProviderConfiguration;

    protected readonly isRubicOptimisationEnabled: boolean = true;

    protected readonly gasMargin = 1.2;

    protected readonly defaultOptions: UniswapV3AlgebraCalculationOptions = {
        slippageTolerance: 0.02,
        deadlineMinutes: 20,
        gasCalculation: 'calculate',
        disableMultihops: false,
        providerAddress: EvmWeb3Pure.EMPTY_ADDRESS,
        useProxy: false
    };

    protected abstract createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStruct,
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

    private async calculateDifficultTrade(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        exact: Exact,
        weiAmount: BigNumber,
        options?: OnChainCalculationOptions
    ): Promise<T> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        if (fullOptions.useProxy) {
            await this.checkContractState(fromToken.blockchain);
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
            gasPriceInfo = await this.getGasPriceInfo();
        }

        const { route, estimatedGas } = await this.getRoute(
            fromClone,
            toClone,
            exact,
            weiAmount,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const { from, to } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            route.outputAbsoluteAmount
        );

        const tradeStruct = {
            from,
            to,
            exact,
            slippageTolerance: fullOptions.slippageTolerance,
            deadlineMinutes: fullOptions.deadlineMinutes
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return this.createTradeInstance(tradeStruct, route, fullOptions.providerAddress);
        }

        const gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return this.createTradeInstance(
            {
                ...tradeStruct,
                gasFeeInfo
            },
            route,
            fullOptions.providerAddress
        );
    }

    private async getRoute(
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
            !this.isRubicOptimisationEnabled &&
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
                this.contractAbi,
                this.contractAddress
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

            const sortedRoutes = calculatedProfits.sort((a, b) => b.profit.comparedTo(a.profit))[0];
            if (!sortedRoutes) {
                throw new RubicSdkError('Sorted routes have to be defined');
            }

            return sortedRoutes;
        }

        const route = routes[0];
        if (!route) {
            throw new RubicSdkError('Route has to be defined');
        }
        const estimatedGas = await this.OnChainTradeClass.estimateGasLimitForRoute(
            from,
            to,
            exact,
            weiAmount,
            options,
            route,
            this.contractAbi,
            this.contractAddress
        );
        return {
            route,
            estimatedGas
        };
    }
}
