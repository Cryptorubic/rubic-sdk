import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import {
    DEFAULT_ESTIMATED_GAS,
    WETH_TO_ETH_ESTIMATED_GAS
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/constants/estimated-gas';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BatchCall } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/models/batch-call';
import { UniswapV3AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-route';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';
import { deadlineMinutesTimestamp } from 'src/common/utils/options';
import { AbiItem } from 'web3-utils';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import BigNumber from 'bignumber.js';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';

export interface UniswapV3AlgebraTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    exact: Exact;
    slippageTolerance: number;
    deadlineMinutes: number;
    gasFeeInfo?: GasFeeInfo | null;
    proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
}

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
        route: UniswapV3AlgebraRoute
    ): Promise<BigNumber> {
        const { from, to } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            weiAmount,
            route.outputAbsoluteAmount
        );

        const estimateGasParams = await this.getEstimateGasParams(from, to, exact, options, route);
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
        routes: UniswapV3AlgebraRoute[]
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
                return this.getEstimateGasParams(from, to, exact, options, route);
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
        route: UniswapV3AlgebraRoute
    ): Promise<{
        callData: BatchCall | null;
        defaultGasLimit: BigNumber;
    }> {
        try {
            // @ts-ignore
            return new this(
                {
                    from,
                    to,
                    exact,
                    slippageTolerance: options.slippageTolerance,
                    deadlineMinutes: options.deadlineMinutes,
                    route
                },
                false
            ).getEstimateGasParams();
        } catch (err) {
            throw new RubicSdkError('Trying to call abstract class method');
        }
    }

    protected abstract readonly contractAbi: AbiItem[];

    protected abstract readonly unwrapWethMethodName: 'unwrapWETH9' | 'unwrapWNativeToken';

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    protected readonly exact: Exact;

    public readonly gasFeeInfo: GasFeeInfo | null;

    public slippageTolerance: number;

    public deadlineMinutes: number;

    public abstract readonly path: ReadonlyArray<Token>;

    protected readonly proxyFeeInfo: OnChainProxyFeeInfo | undefined;

    protected readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

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

    protected constructor(
        tradeStruct: UniswapV3AlgebraTradeStruct,
        useProxy: boolean,
        providerAddress: string
    ) {
        super(useProxy, providerAddress);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.exact = tradeStruct.exact;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
        this.proxyFeeInfo = tradeStruct.proxyFeeInfo;
        this.fromWithoutFee = tradeStruct.fromWithoutFee;
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

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        this.checkFromAddress(options.fromAddress, true);
        this.checkReceiverAddress(options.receiverAddress);

        const { methodName, methodArguments } = this.getSwapRouterMethodData(
            options.receiverAddress || options.fromAddress
        );
        const gasParams = this.getGasParams(options);

        return EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            this.contractAbi,
            methodName,
            methodArguments,
            this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
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
