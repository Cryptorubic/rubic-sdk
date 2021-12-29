/**
 * Shows whether Eth is used as from or to token.
 */
import { combineOptions } from '@common/utils/options';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { LiquidityPoolsController } from '@features/swap/dexes/ethereum/uni-swap-v3/utils/liquidity-pool-controller/liquidity-pools-controller';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { createTokenNativeAddressProxy } from '@features/swap/dexes/common/utils/token-native-address-proxy';
import BigNumber from 'bignumber.js';
import {
    UniSwapV3CalculatedInfo,
    UniSwapV3CalculatedInfoWithProfit
} from '@features/swap/dexes/ethereum/uni-swap-v3/models/uni-swap-v3-calculated-info';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity.error';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { UniSwapV3Trade } from '@features/swap/dexes/ethereum/uni-swap-v3/uni-swap-v3-trade';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';
import { InstantTradeProvider } from '@features/swap/instant-trade-provider';
import { TRADE_TYPE, TradeType } from 'src/features';

const RUBIC_OPTIMIZATION_DISABLED = true;

export class UniSwapV3Provider extends InstantTradeProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    protected readonly defaultOptions: Required<SwapCalculationOptions> = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.02
    };

    protected readonly gasMargin = 1.2;

    private readonly maxTransitPools = 1;

    private wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

    private liquidityPoolsController = new LiquidityPoolsController(this.web3Public);

    public get type(): TradeType {
        return TRADE_TYPE.UNISWAP_V3;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options?: SwapCalculationOptions
    ): Promise<UniSwapV3Trade> {
        const fullOptions = combineOptions(options, this.defaultOptions);

        const fromClone = createTokenNativeAddressProxy(from, this.wethAddress);
        const toClone = createTokenNativeAddressProxy(toToken, this.wethAddress);

        let gasPriceInfo: GasPriceInfo | undefined;
        if (fullOptions.gasCalculation !== 'disabled') {
            gasPriceInfo = await this.getGasPriceInfo();
        }

        const { route, estimatedGas } = await this.getRoute(
            fromClone,
            toClone,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const tradeStruct = {
            from,
            to: new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: route.outputAbsoluteAmount
            }),
            slippageTolerance: fullOptions.slippageTolerance,
            deadlineMinutes: fullOptions.deadlineMinutes,
            route
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return new UniSwapV3Trade(tradeStruct);
        }

        const gasFeeInfo = this.getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return new UniSwapV3Trade({
            ...tradeStruct,
            gasFeeInfo
        });
    }

    /**
     * Returns most profitable route and estimated gas, if related option in {@param options} is set.
     * @param from From token and amount.
     * @param toToken To token.
     * @param options Swap options.
     * @param gasPriceInUsd Gas price in usd.
     */
    private async getRoute(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: Required<SwapCalculationOptions>,
        gasPriceInUsd?: BigNumber
    ): Promise<UniSwapV3CalculatedInfo> {
        const routes = (
            await this.liquidityPoolsController.getAllRoutes(
                from,
                toToken,
                options.disableMultihops ? 0 : this.maxTransitPools
            )
        ).sort((a, b) => b.outputAbsoluteAmount.comparedTo(a.outputAbsoluteAmount));

        if (routes.length === 0) {
            throw new InsufficientLiquidityError();
        }

        if (options.gasCalculation === 'disabled') {
            return {
                route: routes[0]
            };
        }

        if (
            !RUBIC_OPTIMIZATION_DISABLED &&
            options.gasCalculation === 'rubicOptimisation' &&
            toToken.price
        ) {
            const estimatedGasLimits = await UniSwapV3Trade.estimateGasLimitForRoutes(
                from,
                toToken,
                options,
                routes
            );

            const calculatedProfits: UniSwapV3CalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const estimatedGas = estimatedGasLimits[index];
                    const gasFeeInUsd = gasPriceInUsd!.multipliedBy(estimatedGas);
                    const profit = Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
                        .multipliedBy(toToken.price)
                        .minus(gasFeeInUsd);
                    return {
                        route,
                        estimatedGas,
                        profit
                    };
                }
            );

            return calculatedProfits.sort((a, b) => b.profit.comparedTo(a.profit))[0];
        }

        const route = routes[0];
        const estimatedGas = await UniSwapV3Trade.estimateGasLimitForRoute(
            from,
            toToken,
            options,
            route
        );
        return {
            route,
            estimatedGas
        };
    }
}
