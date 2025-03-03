import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { deadlineMinutesTimestamp } from 'src/common/utils/options';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BatchCall } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/batch-call';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import {
    DEFAULT_ESTIMATED_GAS,
    WETH_TO_ETH_ESTIMATED_GAS
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/constants/estimated-gas';
import { CreateTradeInstance } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/create-trade-instance';
import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import {
    UniswapV3AlgebraTradeStruct,
    UniswapV3AlgebraTradeStructOmitPath
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UnwrapWethMethodName } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/unwrapWethMethodName';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';
import { AbiItem } from 'web3-utils';

interface EstimateGasOptions {
    slippageTolerance: number;
    deadlineMinutes: number;
}

export abstract class UniswapV3AlgebraAbstractTrade extends EvmOnChainTrade {
    public static get type(): OnChainTradeType {
        throw new RubicSdkError(`Static TRADE_TYPE getter is not implemented by ${this.name}`);
    }

    public static async estimateGasLimitForRoute(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        exact: Exact,
        weiAmount: BigNumber,
        options: EstimateGasOptions,
        route: UniswapV3AlgebraRoute,
        createTradeInstance: CreateTradeInstance
    ): Promise<BigNumber> {
        const { from, to } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            weiAmount,
            route.outputAbsoluteAmount
        );

        const estimateGasParams = await this.getEstimateGasParams(
            from,
            to,
            exact,
            options,
            route,
            createTradeInstance
        );
        let gasLimit = estimateGasParams.defaultGasLimit;

        const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            from.blockchain
        ).address;
        if (walletAddress && estimateGasParams.callData) {
            const web3Public = Injector.web3PublicService.getWeb3Public(fromToken.blockchain);
            const estimatedGas = (
                await web3Public.batchEstimatedGas(walletAddress, [estimateGasParams.callData])
            )[0];
            if (estimatedGas?.isFinite()) {
                gasLimit = estimatedGas;
            }
        }

        return gasLimit;
    }

    public static async estimateGasLimitForRoutes(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        exact: Exact,
        weiAmount: BigNumber,
        options: EstimateGasOptions,
        routes: UniswapV3AlgebraRoute[],
        createTradeInstance: CreateTradeInstance
    ): Promise<BigNumber[]> {
        const routesEstimateGasParams = await Promise.all(
            routes.map(route => {
                const { from, to } = getFromToTokensAmountsByExact(
                    fromToken,
                    toToken,
                    exact,
                    weiAmount,
                    weiAmount,
                    route.outputAbsoluteAmount
                );
                return this.getEstimateGasParams(
                    from,
                    to,
                    exact,
                    options,
                    route,
                    createTradeInstance
                );
            })
        );
        const gasLimits = routesEstimateGasParams.map(
            estimateGasParams => estimateGasParams.defaultGasLimit
        );

        const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            fromToken.blockchain
        ).address;
        if (
            walletAddress &&
            routesEstimateGasParams.every(estimateGasParams => estimateGasParams.callData)
        ) {
            const web3Public = Injector.web3PublicService.getWeb3Public(fromToken.blockchain);
            const estimatedGasLimits = await web3Public.batchEstimatedGas(
                walletAddress,
                routesEstimateGasParams.map(estimateGasParams => estimateGasParams.callData!)
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
        options: EstimateGasOptions,
        route: UniswapV3AlgebraRoute,
        createTradeInstance: CreateTradeInstance
    ): Promise<{
        callData: BatchCall | null;
        defaultGasLimit: BigNumber;
    }> {
        return createTradeInstance(
            {
                from,
                to,
                exact,
                slippageTolerance: options.slippageTolerance,
                deadlineMinutes: options.deadlineMinutes
            } as UniswapV3AlgebraTradeStructOmitPath,
            route,
            EvmWeb3Pure.EMPTY_ADDRESS
        ).getEstimateGasParams();
    }

    protected abstract readonly contractAbi: AbiItem[];

    protected abstract readonly unwrapWethMethodName: UnwrapWethMethodName;

    protected readonly exact: Exact;

    public deadlineMinutes: number;

    public get type(): OnChainTradeType {
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

    protected constructor(tradeStruct: UniswapV3AlgebraTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this.exact = tradeStruct.exact;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
    }

    protected getAmountParams(): [string, string] {
        if (this.exact === 'input') {
            const amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);
            return [this.fromWithoutFee.stringWeiAmount, amountOutMin];
        }

        const amountInMax = this.fromWithoutFee
            .weiAmountPlusSlippage(this.slippageTolerance)
            .toFixed(0);
        return [this.to.stringWeiAmount, amountInMax];
    }

    /**
     * Returns swap `exactInput` method's name and arguments to use in `swap contract`.
     */
    protected abstract getSwapRouterExactInputMethodData(walletAddress: string): MethodData;

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        const { methodName, methodArguments } = this.getSwapRouterMethodData(
            options.receiverAddress || options.fromAddress
        );
        const gasParams = this.getGasParams(options);

        const config = EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            this.contractAbi,
            methodName,
            methodArguments,
            this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
            gasParams
        );

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }

    protected getSwapRouterMethodData(receiverAddress?: string): MethodData {
        if (!this.to.isNative) {
            const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
                this.getSwapRouterExactInputMethodData(receiverAddress || this.walletAddress);
            return {
                methodName: exactInputMethodName,
                methodArguments: exactInputMethodArguments
            };
        }

        const { methodName: exactInputMethodName, methodArguments: exactInputMethodArguments } =
            this.getSwapRouterExactInputMethodData(EvmWeb3Pure.EMPTY_ADDRESS);
        const exactInputMethodEncoded = EvmWeb3Pure.encodeFunctionCall(
            this.contractAbi,
            exactInputMethodName,
            exactInputMethodArguments
        );

        const amountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance).toFixed(0);
        const unwrapWETHMethodEncoded = EvmWeb3Pure.encodeFunctionCall(
            this.contractAbi,
            this.unwrapWethMethodName,
            [amountOutMin, receiverAddress || this.walletAddress]
        );

        return {
            methodName: 'multicall',
            methodArguments: [[exactInputMethodEncoded, unwrapWETHMethodEncoded]]
        };
    }

    /**
     * Returns encoded data of estimated gas function and default estimated gas.
     */
    private async getEstimateGasParams(): Promise<{
        callData: BatchCall | null;
        defaultGasLimit: BigNumber;
    }> {
        try {
            const transactionConfig = await this.encode({ fromAddress: this.walletAddress });
            return {
                callData: transactionConfig,
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
