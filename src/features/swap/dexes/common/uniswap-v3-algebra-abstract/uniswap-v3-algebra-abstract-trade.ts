import { InstantTrade } from '@features/swap/instant-trade';
import { Cache, RubicSdkError } from 'src/common';
import {
    EncodeTransactionOptions,
    GasFeeInfo,
    SwapTransactionOptions,
    TradeType
} from 'src/features';
import { AbiItem } from 'web3-utils';
import { PriceToken, Token, Web3Pure } from 'src/core';
import { SwapOptions } from '@features/swap/models/swap-options';
import BigNumber from 'bignumber.js';
import { Injector } from '@core/sdk/injector';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { TransactionReceipt } from 'web3-eth';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { BatchCall } from '@core/blockchain/web3-public/models/batch-call';
import { TransactionConfig } from 'web3-core';
import { UniswapV3AbstractTrade } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3AlgebraRoute } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import { deadlineMinutesTimestamp } from '@common/utils/options';
import {
    DEFAULT_ESTIMATED_GAS,
    WETH_TO_ETH_ESTIMATED_GAS
} from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/constants/estimated-gas';

export interface UniswapV3AlgebraTradeStruct {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    slippageTolerance: number;
    deadlineMinutes: number;
    gasFeeInfo?: GasFeeInfo | null;
}

export abstract class UniswapV3AlgebraAbstractTrade extends InstantTrade {
    protected static get contractAbi(): AbiItem[] {
        // see  https://github.com/microsoft/TypeScript/issues/34516
        // @ts-ignore
        const instance = new this();
        if (!instance.contractAbi) {
            throw new RubicSdkError('Trying to read abstract class field');
        }
        return instance.contractAbi;
    }

    @Cache
    protected static get contractAddress(): string {
        // see  https://github.com/microsoft/TypeScript/issues/34516
        // @ts-ignore
        const instance = new this();
        if (!instance.contractAddress) {
            throw new RubicSdkError('Trying to read abstract class field');
        }
        return instance.contractAddress;
    }

    public static get type(): TradeType {
        throw new RubicSdkError(`Static TRADE_TYPE getter is not implemented by ${this.name}`);
    }

    public static async estimateGasLimitForRoute(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: Required<SwapOptions>,
        route: UniswapV3AlgebraRoute
    ): Promise<BigNumber> {
        const estimateGasParams = this.getEstimateGasParams(from, toToken, options, route);
        let gasLimit = estimateGasParams.defaultGasLimit;

        const walletAddress = Injector.web3Private.address;
        if (walletAddress) {
            const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
            const estimatedGas = await web3Public.getEstimatedGas(
                this.contractAbi,
                this.contractAddress,
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
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: Required<SwapOptions>,
        routes: UniswapV3AlgebraRoute[]
    ): Promise<BigNumber[]> {
        const routesEstimateGasParams = routes.map(route =>
            this.getEstimateGasParams(from, toToken, options, route)
        );
        const gasLimits = routesEstimateGasParams.map(
            estimateGasParams => estimateGasParams.defaultGasLimit
        );

        const walletAddress = Injector.web3Private.address;
        if (walletAddress) {
            const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
            const estimatedGasLimits = await web3Public.batchEstimatedGas(
                this.contractAbi,
                this.contractAddress,
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
        toToken: PriceToken,
        options: Required<SwapOptions>,
        route: UniswapV3AlgebraRoute
    ) {
        try {
            // @ts-ignore
            return new this({
                from,
                to: new PriceTokenAmount({
                    ...toToken.asStruct,
                    weiAmount: route.outputAbsoluteAmount
                }),
                slippageTolerance: options.slippageTolerance,
                deadlineMinutes: options.deadlineMinutes,
                route
            }).getEstimateGasParams();
        } catch (err) {
            console.debug(err);
            throw new RubicSdkError('Trying to call abstract class method');
        }
    }

    protected abstract readonly contractAbi: AbiItem[];

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

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
        return DEFAULT_ESTIMATED_GAS[this.path.length - 2].plus(
            this.from.isNative ? WETH_TO_ETH_ESTIMATED_GAS : 0
        );
    }

    /**
     * True if class is instance of Uniswap-V3, false if of Algebra.
     */
    private get isUniswapV3(): boolean {
        return this instanceof UniswapV3AbstractTrade;
    }

    protected constructor(tradeStruct: UniswapV3AlgebraTradeStruct) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
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

    public async encode(options: EncodeTransactionOptions = {}): Promise<TransactionConfig> {
        const { methodName, methodArguments } = this.getSwapRouterMethodData();
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

    private getSwapRouterMethodData(): MethodData {
        if (!this.to.isNative) {
            const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
                this.getSwapRouterExactInputMethodData(this.walletAddress);
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
            this.isUniswapV3 ? 'unwrapWETH9' : 'unwrapWNativeToken',
            [amountOutMin, this.walletAddress]
        );

        return {
            methodName: 'multicall',
            methodArguments: [[exactInputMethodEncoded, unwrapWETHMethodEncoded]]
        };
    }

    /**
     * Returns encoded data of estimated gas function and default estimated gas.
     */
    private getEstimateGasParams(): { callData: BatchCall; defaultGasLimit: BigNumber } {
        const { methodName, methodArguments } = this.getSwapRouterMethodData();

        return {
            callData: {
                contractMethod: methodName,
                params: methodArguments,
                value: this.from.isNative ? this.from.stringWeiAmount : undefined
            },
            defaultGasLimit: this.defaultEstimatedGas
        };
    }
}
