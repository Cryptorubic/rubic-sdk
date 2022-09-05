import { InstantTrade } from '@rsdk-features/instant-trades/instant-trade';
import { PriceToken, PriceTokenAmount, RubicSdkError, Token } from 'src/common';
import {
    EncodeTransactionOptions,
    GasFeeInfo,
    SwapTransactionOptions,
    TradeType
} from 'src/features';
import { AbiItem } from 'web3-utils';
import { Web3Pure } from 'src/core';
import { SwapOptions } from '@rsdk-features/instant-trades/models/swap-options';
import BigNumber from 'bignumber.js';
import { Injector } from '@rsdk-core/sdk/injector';
import { TransactionReceipt } from 'web3-eth';
import { MethodData } from '@rsdk-core/blockchain/web3-public/models/method-data';
import { BatchCall } from '@rsdk-core/blockchain/web3-public/models/batch-call';
import { TransactionConfig } from 'web3-core';
import { UniswapV3AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3AlgebraRoute } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import { deadlineMinutesTimestamp } from '@rsdk-common/utils/options';
import {
    DEFAULT_ESTIMATED_GAS,
    WETH_TO_ETH_ESTIMATED_GAS
} from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/constants/estimated-gas';
import { Exact } from '@rsdk-features/instant-trades/models/exact';
import { getFromToTokensAmountsByExact } from '@rsdk-features/instant-trades/dexes/common/utils/get-from-to-tokens-amounts-by-exact';

export interface UniswapV3AlgebraTradeStruct {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    exact: Exact;
    slippageTolerance: number;
    deadlineMinutes: number;
    gasFeeInfo?: GasFeeInfo | null;
}

export abstract class UniswapV3AlgebraAbstractTrade extends InstantTrade {
    public static get type(): TradeType {
        throw new RubicSdkError(`Static TRADE_TYPE getter is not implemented by ${this.name}`);
    }

    public static async estimateGasLimitForRoute(
        fromToken: PriceToken,
        toToken: PriceToken,
        exact: Exact,
        weiAmount: BigNumber,
        options: Required<SwapOptions>,
        route: UniswapV3AlgebraRoute,
        contractAbi: AbiItem[],
        contractAddress: string
    ): Promise<BigNumber> {
        const { from, to } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            route.outputAbsoluteAmount
        );

        const estimateGasParams = this.getEstimateGasParams(from, to, exact, options, route);
        let gasLimit = estimateGasParams.defaultGasLimit;

        const walletAddress = Injector.web3Private.address;
        if (walletAddress && estimateGasParams.callData) {
            const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
            const estimatedGas = await web3Public.getEstimatedGas(
                contractAbi,
                contractAddress,
                estimateGasParams.callData.contractMethod,
                estimateGasParams.callData.params,
                walletAddress,
                estimateGasParams.callData.value
            );
            if (estimatedGas?.isFinite()) {
                gasLimit = estimatedGas;
            }
        }

        return gasLimit;
    }

    public static async estimateGasLimitForRoutes(
        fromToken: PriceToken,
        toToken: PriceToken,
        exact: Exact,
        weiAmount: BigNumber,
        options: Required<SwapOptions>,
        routes: UniswapV3AlgebraRoute[],
        contractAbi: AbiItem[],
        contractAddress: string
    ): Promise<BigNumber[]> {
        const routesEstimateGasParams = routes.map(route => {
            const { from, to } = getFromToTokensAmountsByExact(
                fromToken,
                toToken,
                exact,
                weiAmount,
                route.outputAbsoluteAmount
            );
            return this.getEstimateGasParams(from, to, exact, options, route);
        });
        const gasLimits = routesEstimateGasParams.map(
            estimateGasParams => estimateGasParams.defaultGasLimit
        );

        const walletAddress = Injector.web3Private.address;
        if (
            walletAddress &&
            routesEstimateGasParams.every(estimateGasParams => estimateGasParams.callData)
        ) {
            const web3Public = Injector.web3PublicService.getWeb3Public(fromToken.blockchain);
            const estimatedGasLimits = await web3Public.batchEstimatedGas(
                contractAbi,
                contractAddress,
                walletAddress,
                routesEstimateGasParams.map(estimateGasParams => estimateGasParams.callData)
            );
            estimatedGasLimits.forEach((elem, index) => {
                if (elem?.isFinite()) {
                    gasLimits[index] = elem;
                }
            });
        }

        return gasLimits;
    }

    private static getEstimateGasParams(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        exact: Exact,
        options: Required<SwapOptions>,
        route: UniswapV3AlgebraRoute
    ) {
        try {
            // @ts-ignore
            return new this({
                from,
                to,
                exact,
                slippageTolerance: options.slippageTolerance,
                deadlineMinutes: options.deadlineMinutes,
                route
            }).getEstimateGasParams();
        } catch (err) {
            throw new RubicSdkError('Trying to call abstract class method');
        }
    }

    protected abstract readonly contractAbi: AbiItem[];

    protected abstract readonly unwrapWethMethodName: 'unwrapWETH9' | 'unwrapWNativeToken';

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    protected readonly exact: Exact;

    public readonly gasFeeInfo: GasFeeInfo | null;

    public slippageTolerance: number;

    public deadlineMinutes: number;

    public abstract readonly path: ReadonlyArray<Token>;

    public get type(): TradeType {
        return (<typeof UniswapV3AbstractTrade>this.constructor).type;
    }

    protected get deadlineMinutesTimestamp(): number {
        return deadlineMinutesTimestamp(this.deadlineMinutes);
    }

    private get defaultEstimatedGas(): BigNumber {
        const estimatedGas = DEFAULT_ESTIMATED_GAS[this.path.length - 2];
        if (!estimatedGas) {
            throw new RubicSdkError('Default estimated gas has to be defined');
        }
        return estimatedGas.plus(this.to.isNative ? WETH_TO_ETH_ESTIMATED_GAS : 0);
    }

    protected constructor(tradeStruct: UniswapV3AlgebraTradeStruct) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.exact = tradeStruct.exact;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
    }

    protected getAmountParams(): [string, string] {
        if (this.exact === 'input') {
            const amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);
            return [this.from.stringWeiAmount, amountOutMin];
        }

        const amountInMax = this.from.weiAmountPlusSlippage(this.slippageTolerance).toFixed(0);
        return [this.to.stringWeiAmount, amountInMax];
    }

    /**
     * Returns swap `exactInput` method's name and arguments to use in `swap contract`.
     */
    protected abstract getSwapRouterExactInputMethodData(walletAddress: string): MethodData;

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();
        await this.checkAllowanceAndApprove(options);

        const { methodName, methodArguments } = this.getSwapRouterMethodData();
        const { gas, gasPrice } = this.getGasParams(options);

        return Injector.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.contractAbi,
            methodName,
            methodArguments,
            {
                value: this.from.isNative ? this.from.stringWeiAmount : undefined,
                onTransactionHash: options.onConfirm,
                gas,
                gasPrice
            }
        );
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        const { methodName, methodArguments } = this.getSwapRouterMethodData(options.fromAddress);
        const gasParams = this.getGasParams(options);

        return Web3Pure.encodeMethodCall(
            this.contractAddress,
            this.contractAbi,
            methodName,
            methodArguments,
            this.from.isNative ? this.from.stringWeiAmount : undefined,
            gasParams
        );
    }

    private getSwapRouterMethodData(fromAddress?: string): MethodData {
        if (!this.to.isNative) {
            const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
                this.getSwapRouterExactInputMethodData(fromAddress || this.walletAddress);
            return {
                methodName: exactInputMethodName,
                methodArguments: exactInputMethodArguments
            };
        }

        const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
            this.getSwapRouterExactInputMethodData(Web3Pure.ZERO_ADDRESS);
        const exactInputMethodEncoded = Web3Pure.encodeFunctionCall(
            this.contractAbi,
            exactInputMethodName,
            exactInputMethodArguments
        );

        const amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);
        const unwrapWETHMethodEncoded = Web3Pure.encodeFunctionCall(
            this.contractAbi,
            this.unwrapWethMethodName,
            [amountOutMin, fromAddress || this.walletAddress]
        );

        return {
            methodName: 'multicall',
            methodArguments: [[exactInputMethodEncoded, unwrapWETHMethodEncoded]]
        };
    }

    /**
     * Returns encoded data of estimated gas function and default estimated gas.
     */
    private getEstimateGasParams(): { callData: BatchCall | null; defaultGasLimit: BigNumber } {
        try {
            const { methodName, methodArguments } = this.getSwapRouterMethodData();

            return {
                callData: {
                    contractMethod: methodName,
                    params: methodArguments,
                    value: this.from.isNative ? this.from.stringWeiAmount : undefined
                },
                defaultGasLimit: this.defaultEstimatedGas
            };
        } catch (_err) {
            return {
                callData: null,
                defaultGasLimit: this.defaultEstimatedGas
            };
        }
    }
}
