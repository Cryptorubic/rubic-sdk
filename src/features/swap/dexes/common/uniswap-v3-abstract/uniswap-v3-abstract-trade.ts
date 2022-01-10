import { UniswapV3Route } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import {
    EncodeTransactionOptions,
    GasFeeInfo,
    SwapTransactionOptions,
    TradeType
} from 'src/features';
import { TransactionReceipt } from 'web3-eth';
import { Injector } from '@core/sdk/injector';
import { SWAP_ROUTER_CONTRACT_ABI } from '@features/swap/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { TransactionConfig } from 'web3-core';
import { MethodData } from '@core/blockchain/web3-public/models/method-data';
import { UniswapV3QuoterController } from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { BatchCall } from '@core/blockchain/web3-public/models/batch-call';
import BigNumber from 'bignumber.js';
import {
    DEFAULT_ESTIMATED_GAS,
    WETH_TO_ETH_ESTIMATED_GAS
} from '@features/swap/dexes/common/uniswap-v3-abstract/constants/estimated-gas';
import { deadlineMinutesTimestamp } from '@common/utils/options';
import { Cache, compareAddresses, Pure, RubicSdkError } from 'src/common';
import { SwapOptions } from '@features/swap/models/swap-options';
import { AbiItem } from 'web3-utils';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Pure } from 'src/core';
import { InstantTrade } from '@features/swap/instant-trade';

export type UniswapV3TradeStruct = {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    slippageTolerance: number;
    deadlineMinutes: number;
    route: UniswapV3Route;
    gasFeeInfo?: GasFeeInfo | null;
};

export abstract class UniswapV3AbstractTrade extends InstantTrade {
    public static readonly contractAbi: AbiItem[] = SWAP_ROUTER_CONTRACT_ABI;

    @Cache
    public static get getContractAddress(): string {
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
        route: UniswapV3Route
    ): Promise<BigNumber> {
        const estimateGasParams = UniswapV3AbstractTrade.getEstimateGasParams(
            from,
            toToken,
            options,
            route
        );
        let gasLimit = estimateGasParams.defaultGasLimit;

        const walletAddress = Injector.web3Private.address;
        if (walletAddress) {
            const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
            const estimatedGas = await web3Public.getEstimatedGas(
                this.contractAbi,
                this.getContractAddress,
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
        routes: UniswapV3Route[]
    ): Promise<BigNumber[]> {
        const routesEstimateGasParams = routes.map(route =>
            UniswapV3AbstractTrade.getEstimateGasParams(from, toToken, options, route)
        );
        const gasLimits = routesEstimateGasParams.map(
            estimateGasParams => estimateGasParams.defaultGasLimit
        );

        const walletAddress = Injector.web3Private.address;
        if (walletAddress) {
            const web3Public = Injector.web3PublicService.getWeb3Public(from.blockchain);
            const estimatedGasLimits = await web3Public.batchEstimatedGas(
                this.contractAbi,
                this.getContractAddress,
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
        route: UniswapV3Route
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

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly gasFeeInfo: GasFeeInfo | null;

    public slippageTolerance: number;

    public deadlineMinutes: number;

    private readonly route: UniswapV3Route;

    private get deadlineMinutesTimestamp(): number {
        return deadlineMinutesTimestamp(this.deadlineMinutes);
    }

    public get type(): TradeType {
        return (<typeof UniswapV3AbstractTrade>this.constructor).type;
    }

    @Pure
    public get path(): ReadonlyArray<Token> {
        const initialPool = this.route.poolsPath[0];
        const path: Token[] = [
            compareAddresses(initialPool.token0.address, this.route.initialTokenAddress)
                ? initialPool.token0
                : initialPool.token1
        ];
        return path.concat(
            ...this.route.poolsPath.map(pool =>
                !compareAddresses(pool.token0.address, path[path.length - 1].address)
                    ? pool.token0
                    : pool.token1
            )
        );
    }

    protected constructor(tradeStruct: UniswapV3TradeStruct) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
        this.route = tradeStruct.route;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        const { methodName, methodArguments } = this.getSwapRouterMethodData();
        const { gas, gasPrice } = this.getGasParams(options);

        return Injector.web3Private.tryExecuteContractMethod(
            this.contractAddress,
            UniswapV3AbstractTrade.contractAbi,
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
            UniswapV3AbstractTrade.contractAbi,
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
            UniswapV3AbstractTrade.contractAbi,
            exactInputMethodName,
            exactInputMethodArguments
        );

        const amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);
        const unwrapWETHMethodEncoded = Web3Pure.encodeFunctionCall(
            UniswapV3AbstractTrade.contractAbi,
            'unwrapWETH9',
            [amountOutMin, this.walletAddress]
        );

        return {
            methodName: 'multicall',
            methodArguments: [[exactInputMethodEncoded, unwrapWETHMethodEncoded]]
        };
    }

    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    private getSwapRouterExactInputMethodData(walletAddress: string): MethodData {
        const amountOutMin = this.from.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);

        if (this.route.poolsPath.length === 1) {
            return {
                methodName: 'exactInputSingle',
                methodArguments: [
                    [
                        this.route.initialTokenAddress,
                        this.to.address,
                        this.route.poolsPath[0].fee,
                        walletAddress,
                        this.deadlineMinutesTimestamp,
                        this.from.weiAmount,
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
                    UniswapV3QuoterController.getEncodedPoolsPath(
                        this.route.poolsPath,
                        this.route.initialTokenAddress
                    ),
                    walletAddress,
                    this.deadlineMinutesTimestamp,
                    this.from.weiAmount,
                    amountOutMin
                ]
            ]
        };
    }

    /**
     * Returns encoded data of estimated gas function and default estimated gas.
     */
    private getEstimateGasParams(): { callData: BatchCall; defaultGasLimit: BigNumber } {
        const defaultEstimateGas = DEFAULT_ESTIMATED_GAS[this.route.poolsPath.length - 1].plus(
            this.from.isNative ? WETH_TO_ETH_ESTIMATED_GAS : 0
        );

        const { methodName, methodArguments } = this.getSwapRouterMethodData();

        return {
            callData: {
                contractMethod: methodName,
                params: methodArguments,
                value: this.from.isNative ? this.from.stringWeiAmount : undefined
            },
            defaultGasLimit: defaultEstimateGas
        };
    }
}
