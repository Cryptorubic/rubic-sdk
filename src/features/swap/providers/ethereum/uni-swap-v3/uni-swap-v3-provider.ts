/**
 * Shows whether Eth is used as from or to token.
 */
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Injector } from '@core/sdk/injector';
import { LiquidityPoolsController } from '@features/swap/providers/ethereum/uni-swap-v3/utils/liquidity-pool-controller/liquidity-pools-controller';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { SwapOptions } from '@features/swap/models/swap-options';
import { createTokenWethAbleProxy } from '@features/swap/providers/common/utils/weth';
import BigNumber from 'bignumber.js';
import {
    UniSwapV3CalculatedInfo,
    UniSwapV3CalculatedInfoWithProfit
} from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-calculated-info';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity-error';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { UniSwapV3Trade } from '@features/swap/trades/ethereum/uni-swap-v3/uni-swap-v3-trade';

const RUBIC_OPTIMIZATION_DISABLED = true;

export class UniSwapV3Provider {
    private readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    /**
     * Amount by which estimated gas should be increased (1.2 = 120%).
     */
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
        options: SwapOptions = {
            gasCalculation: 'calculate',
            disableMultihops: false,
            deadline: 1200000, // 20 min
            slippageTolerance: 0.05
        }
    ): Promise<UniSwapV3Trade> {
        const fromClone = createTokenWethAbleProxy(from, this.wethAddress);
        const toClone = createTokenWethAbleProxy(toToken, this.wethAddress);

        let gasPrice: string | undefined;
        let gasPriceInEth: BigNumber | undefined;
        let gasPriceInUsd: BigNumber | undefined;
        if (options.gasCalculation !== 'disabled') {
            let nativeCoinPrice: BigNumber;
            [gasPrice, nativeCoinPrice] = await Promise.all([
                this.gasPriceApi.getGasPrice(this.blockchain),
                this.coingeckoApi.getNativeCoinPrice(this.blockchain)
            ]);
            gasPriceInEth = Web3Pure.fromWei(gasPrice);
            gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
        }

        const { route, gasLimit } = await this.getRoute(fromClone, toClone, options, gasPriceInUsd);

        const trade = {
            from,
            to: new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: route.outputAbsoluteAmount
            }),
            gasInfo: null,
            slippageTolerance: options.slippageTolerance,
            deadlineMinutes: options.deadline,
            route
        };
        if (options.gasCalculation === 'disabled') {
            return new UniSwapV3Trade(trade);
        }

        const increasedGas = Web3Pure.calculateGasMargin(gasLimit, this.GAS_MARGIN);
        const gasFeeInEth = gasPriceInEth!.multipliedBy(increasedGas);
        const gasFeeInUsd = gasPriceInUsd!.multipliedBy(increasedGas);

        return new UniSwapV3Trade({
            ...trade,
            gasInfo: {
                gasLimit: increasedGas,
                gasPrice: gasPrice!,
                gasFeeInEth,
                gasFeeInUsd
            }
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
        options: SwapOptions,
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
                options.slippageTolerance,
                options.deadline,
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
            options.slippageTolerance,
            options.deadline,
            route
        );
        return {
            route,
            gasLimit
        };
    }
}
