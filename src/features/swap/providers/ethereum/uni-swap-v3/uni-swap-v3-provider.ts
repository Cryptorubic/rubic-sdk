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
import { UniSwapV3InstantTrade } from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-instant-trade';
import BigNumber from 'bignumber.js';
import {
    UniSwapV3CalculatedInfo,
    UniSwapV3CalculatedInfoWithProfit
} from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-calculated-info';
import {
    maxTransitPools,
    uniSwapV3ContractData
} from '@features/swap/providers/ethereum/uni-swap-v3/uni-swap-v3-constants';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity-error';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { UniSwapV3Route } from '@features/swap/providers/ethereum/uni-swap-v3/models/uni-swap-v3-route';
import { BatchCall } from '@core/blockchain/web3-public/models/batch-call';
import {
    swapEstimatedGas,
    WethToEthEstimatedGas
} from '@features/swap/providers/ethereum/uni-swap-v3/constants/estimated-gas';
import { compareAddresses, deadlineMinutesTimestamp } from '@common/utils/blockchain';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { SymbolToken } from '@core/blockchain/tokens/symbol-token';

const RUBIC_OPTIMIZATION_DISABLED = true;

export class UniSwapV3Provider {
    /**
     * Returns swap method's name and argument to use in Swap contract.
     * @param route Route to use in a swap.
     * @param fromToken From token.
     * @param toTokenAddress To token address.
     * @param walletAddress Wallet address, making swap.
     * @param slippageTolerance Slippage tolerance.
     * @param deadline Deadline of swap in seconds.
     */
    private static getSwapRouterExactInputMethodParams(
        route: UniSwapV3Route,
        fromToken: PriceTokenAmount,
        toTokenAddress: string,
        walletAddress: string,
        slippageTolerance: number,
        deadline: number
    ): MethodData {
        const amountOutMin = fromToken.weiAmountMinusSlippage(slippageTolerance).toFixed(0);

        if (route.poolsPath.length === 1) {
            return {
                methodName: 'exactInputSingle',
                methodArguments: [
                    [
                        route.initialTokenAddress,
                        toTokenAddress,
                        route.poolsPath[0].fee,
                        walletAddress,
                        deadline,
                        fromToken.weiAmount,
                        amountOutMin,
                        0
                    ]
                ]
            };
        }
        return {
            methodName: 'exactInput',
            methodArguments: [
                [
                    LiquidityPoolsController.getEncodedPoolsPath(
                        route.poolsPath,
                        route.initialTokenAddress
                    ),
                    walletAddress,
                    deadline,
                    fromToken.weiAmount,
                    amountOutMin
                ]
            ]
        };
    }

    /**
     * Amount by which estimated gas should be increased (1.2 = 120%).
     */
    private readonly GAS_MARGIN = 1.2;

    private readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    private wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

    private web3Public = Injector.web3PublicService.getWeb3Public(this.blockchain);

    private web3Private = Injector.web3Private;

    private gasPriceApi = Injector.gasPriceApi;

    private coingeckoApi = Injector.coingeckoApi;

    private liquidityPoolsController = new LiquidityPoolsController(this.web3Public);

    private get walletAddress(): string {
        return this.web3Private.address;
    }

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
    ): Promise<UniSwapV3InstantTrade> {
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

        const initialPool = route.poolsPath[0];
        const path: SymbolToken[] = [
            compareAddresses(initialPool.token0.address, route.initialTokenAddress)
                ? initialPool.token0
                : initialPool.token1
        ];
        path.push(
            ...route.poolsPath.map(pool => {
                return !compareAddresses(pool.token0.address, path[path.length - 1].address)
                    ? pool.token0
                    : pool.token1;
            })
        );

        const trade: UniSwapV3InstantTrade = {
            from,
            to: new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: route.outputAbsoluteAmount
            }),
            gasInfo: null,
            slippageTolerance: options.slippageTolerance,
            deadline: options.deadline,
            path,
            route
        };
        if (options.gasCalculation === 'disabled') {
            return trade;
        }

        const increasedGas = Web3Pure.calculateGasMargin(gasLimit, this.GAS_MARGIN);
        const gasFeeInEth = gasPriceInEth!.multipliedBy(increasedGas);
        const gasFeeInUsd = gasPriceInUsd!.multipliedBy(increasedGas);

        return {
            ...trade,
            gasInfo: {
                gasLimit: increasedGas,
                gasPrice: gasPrice!,
                gasFeeInEth,
                gasFeeInUsd
            }
        };
    }

    /**
     * Returns most profitable route and estimated gas, if related option in {@param options} is set.
     * @param from From token and amount.
     * @param toToken To token.
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
                options.disableMultihops ? 0 : maxTransitPools
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

        const deadlineTimestamp = deadlineMinutesTimestamp(options.deadline);

        if (
            !RUBIC_OPTIMIZATION_DISABLED &&
            options.gasCalculation === 'rubicOptimisation' &&
            toToken.price
        ) {
            const gasRequests = routes.map(route =>
                this.getEstimateGasMethodSignature(
                    route,
                    from,
                    toToken.address,
                    options.slippageTolerance,
                    deadlineTimestamp
                )
            );
            const gasLimits = gasRequests.map(item => item.defaultGasLimit);

            if (this.walletAddress) {
                const estimatedGasLimits = await this.web3Public.batchEstimatedGas(
                    uniSwapV3ContractData.swapRouter.abi,
                    uniSwapV3ContractData.swapRouter.address,
                    this.walletAddress,
                    gasRequests.map(item => item.callData)
                );
                estimatedGasLimits.forEach((elem, index) => {
                    if (elem?.isFinite()) {
                        gasLimits[index] = elem.toFixed(0);
                    }
                });
            }

            const calculatedProfits: UniSwapV3CalculatedInfoWithProfit[] = routes.map(
                (route, index) => {
                    const gasLimit = gasLimits[index];
                    const gasFeeInUsd = new BigNumber(gasLimit).multipliedBy(gasPriceInUsd!);
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
        const estimateGasParams = this.getEstimateGasMethodSignature(
            route,
            from,
            toToken.address,
            options.slippageTolerance,
            deadlineTimestamp
        );
        const gasLimit = await this.web3Public
            .getEstimatedGas(
                uniSwapV3ContractData.swapRouter.abi,
                uniSwapV3ContractData.swapRouter.address,
                estimateGasParams.callData.contractMethod,
                estimateGasParams.callData.params,
                this.walletAddress,
                estimateGasParams.callData.value
            )
            .catch(() => estimateGasParams.defaultGasLimit);
        return {
            route,
            gasLimit
        };
    }

    /**
     * Returns encoded data of estimated gas function and default estimated gas.
     * @param route Route to use in a swap.
     * @param fromToken From token.
     * @param toTokenAddress To token address.
     * @param slippageTolerance Slippage tolerance.
     * @param deadline Deadline of swap in seconds.
     */
    private getEstimateGasMethodSignature(
        route: UniSwapV3Route,
        fromToken: PriceTokenAmount,
        toTokenAddress: string,
        slippageTolerance: number,
        deadline: number
    ): { callData: BatchCall; defaultGasLimit: string } {
        const defaultEstimateGas = swapEstimatedGas[route.poolsPath.length - 1]
            .plus(fromToken.isNative ? WethToEthEstimatedGas : 0)
            .toFixed(0);

        const { methodName, methodArguments } =
            UniSwapV3Provider.getSwapRouterExactInputMethodParams(
                route,
                fromToken,
                toTokenAddress,
                this.walletAddress,
                slippageTolerance,
                deadline
            );

        return {
            callData: {
                contractMethod: methodName,
                params: methodArguments,
                value: fromToken.isNative ? fromToken.weiAmount.toFixed(0) : undefined
            },
            defaultGasLimit: defaultEstimateGas
        };
    }
}
