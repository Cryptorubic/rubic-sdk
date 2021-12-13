/**
 * Shows whether Eth is used as from or to token.
 */
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Injector } from '@core/sdk/injector';
import { LiquidityPoolsController } from '@features/swap/providers/ethereum/uni-swap-v3/utils/liquidity-pool-controller/liquidity-pools-controller';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { createTokenWethAbleProxy } from '@features/swap/providers/common/utils/weth';
import BigNumber from 'bignumber.js';
import {
    UniSwapV3CalculatedInfo,
    UniSwapV3CalculatedInfoWithProfit
} from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-calculated-info';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity-error';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { UniSwapV3Trade } from '@features/swap/trades/ethereum/uni-swap-v3/uni-swap-v3-trade';
import { GasPriceInfo } from '@features/swap/models/gas-price-info';
import { SwapCalculationOptions } from '@features/swap/models/swap-calculation-options';

const RUBIC_OPTIMIZATION_DISABLED = true;

export class UniSwapV3Provider {
    private readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    protected readonly defaultOptions: SwapCalculationOptions = {
        gasCalculation: 'calculate',
        disableMultihops: false,
        deadlineMinutes: 20,
        slippageTolerance: 0.05
    };

    private readonly GAS_MARGIN = 1.2;

    private readonly maxTransitPools = 1;

    private wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

    private web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);

    private gasPriceApi = Injector.gasPriceApi;

    private coingeckoApi = Injector.coingeckoApi;

    private liquidityPoolsController = new LiquidityPoolsController(this.web3Public);

    constructor() {}

    public async calculateTrade(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options?: Partial<SwapCalculationOptions>
    ): Promise<UniSwapV3Trade> {
        const fullOptions: SwapCalculationOptions = { ...this.defaultOptions, ...options };

        const fromClone = createTokenWethAbleProxy(from, this.wethAddress);
        const toClone = createTokenWethAbleProxy(toToken, this.wethAddress);

        let gasPriceInfo: GasPriceInfo | undefined;
        if (fullOptions.gasCalculation !== 'disabled') {
            gasPriceInfo = await this.getGasPriceInfo();
        }

        const { route, gasLimit } = await this.getRoute(
            fromClone,
            toClone,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const trade = {
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
            return new UniSwapV3Trade(trade);
        }

        const increasedGas = Web3Pure.calculateGasMargin(gasLimit, this.GAS_MARGIN);
        const gasFeeInEth = gasPriceInfo!.gasPriceInEth.multipliedBy(increasedGas);
        const gasFeeInUsd = gasPriceInfo!.gasPriceInUsd.multipliedBy(increasedGas);

        return new UniSwapV3Trade({
            ...trade,
            gasFeeInfo: {
                gasLimit: new BigNumber(increasedGas),
                gasPrice: gasPriceInfo!.gasPrice,
                gasFeeInEth,
                gasFeeInUsd
            }
        });
    }

    private async getGasPriceInfo(): Promise<GasPriceInfo> {
        const [gasPrice, nativeCoinPrice] = await Promise.all([
            this.gasPriceApi.getGasPrice(this.blockchain),
            this.coingeckoApi.getNativeCoinPrice(this.blockchain)
        ]);
        const gasPriceInEth = Web3Pure.fromWei(gasPrice);
        const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
        return {
            gasPrice: new BigNumber(gasPrice),
            gasPriceInEth,
            gasPriceInUsd
        };
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
        options: SwapCalculationOptions,
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
            const gasLimits = await UniSwapV3Trade.calculateGasLimitsForRoutes(
                from,
                toToken,
                options,
                routes
            );

            const calculatedProfits: UniSwapV3CalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const gasLimit = gasLimits[index];
                    const gasFeeInUsd = gasPriceInUsd!.multipliedBy(gasLimit);
                    const profit = Web3Pure.fromWei(route.outputAbsoluteAmount, toToken.decimals)
                        .multipliedBy(toToken.price)
                        .minus(gasFeeInUsd);
                    return {
                        route,
                        gasLimit,
                        profit
                    };
                }
            );

            return calculatedProfits.sort((a, b) => b.profit.comparedTo(a.profit))[0];
        }

        const route = routes[0];
        const gasLimit = await UniSwapV3Trade.calculateGasLimitForRoute(
            from,
            toToken,
            options,
            route
        );
        return {
            route,
            gasLimit
        };
    }
}
