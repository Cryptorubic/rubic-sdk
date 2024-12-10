import { LowSlippageDeflationaryTokenError, RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { parseError } from 'src/common/utils/errors';
import { tryExecuteAsync } from 'src/common/utils/functions';
import { deadlineMinutesTimestamp } from 'src/common/utils/options';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { ContractMulticallResponse } from 'src/core/blockchain/web3-public-service/web3-public/models/contract-multicall-response';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { defaultEstimatedGas } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/default-estimated-gas';
import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethod,
    SUPPORTING_FEE_SWAP_METHODS_MAPPING,
    SWAP_METHOD
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';
import { defaultUniswapV2Abi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/uniswap-v2-abi';
import { AerodromeRoutePoolArgument } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/aerodrome-route-method-arguments';
import { DefaultEstimatedGas } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/default-estimated-gas';
import { ExtendedRoutesMethodArguments } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/route-method-arguments';
import { UniswapV2TradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-trade-struct';
import { AbiItem } from 'web3-utils';

export abstract class UniswapV2AbstractTrade extends EvmOnChainTrade {
    /** @internal */
    @Cache
    public static getDexContractAddress(blockchain: BlockchainName): string {
        // see https://github.com/microsoft/TypeScript/issues/34516
        // @ts-ignore
        const instance = new this(
            {
                from: { blockchain },
                wrappedPath: [{ isNative: () => false }, { isNative: () => false }]
            },
            false
        );
        if (!instance.dexContractAddress) {
            throw new RubicSdkError('Trying to read abstract class field');
        }
        return instance.dexContractAddress;
    }

    public static get type(): OnChainTradeType {
        throw new RubicSdkError(`Static TRADE_TYPE getter is not implemented by ${this.name}`);
    }

    /** @internal */
    public static readonly contractAbi: AbiItem[] = defaultUniswapV2Abi;

    /** @internal */
    public static readonly swapMethods: ExactInputOutputSwapMethodsList = SWAP_METHOD;

    /** @internal */
    public static readonly defaultEstimatedGasInfo: DefaultEstimatedGas = defaultEstimatedGas;

    public static callForRoutes(
        blockchain: EvmBlockchainName,
        exact: Exact,
        routesMethodArguments: ExtendedRoutesMethodArguments
    ): Promise<ContractMulticallResponse<string[]>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        const methodName = exact === 'input' ? 'getAmountsOut' : 'getAmountsIn';
        return web3Public.multicallContractMethod<string[]>(
            this.getDexContractAddress(blockchain),
            this.contractAbi,
            methodName,
            routesMethodArguments
        );
    }

    /**
     * Deadline for transaction in minutes.
     */
    public readonly deadlineMinutes: number;

    /**
     * @internal
     * Path with wrapped native address.
     */
    public readonly wrappedPath: ReadonlyArray<Token>;

    public readonly routPoolInfo: AerodromeRoutePoolArgument[] | undefined;

    /**
     * Defines, whether to call 'exactInput' or 'exactOutput' method.
     */
    public readonly exact: Exact;

    public get type(): OnChainTradeType {
        return (this.constructor as typeof UniswapV2AbstractTrade).type;
    }

    protected get deadlineMinutesTimestamp(): number {
        return deadlineMinutesTimestamp(this.deadlineMinutes);
    }

    protected get nativeValueToSend(): string | undefined {
        if (this.from.isNative) {
            return this.getAmountInAndAmountOut().amountIn;
        }
        return '0';
    }

    private get regularSwapMethod(): string {
        return (<typeof UniswapV2AbstractTrade>this.constructor).swapMethods[this.exact][
            this.regularSwapMethodKey
        ];
    }

    private get supportedFeeSwapMethod(): string {
        return (<typeof UniswapV2AbstractTrade>this.constructor).swapMethods[this.exact][
            SUPPORTING_FEE_SWAP_METHODS_MAPPING[this.regularSwapMethodKey]
        ];
    }

    private get regularSwapMethodKey(): RegularSwapMethod {
        if (this.from.isNative) {
            return 'ETH_TO_TOKENS';
        }
        if (this.to.isNative) {
            return 'TOKENS_TO_ETH';
        }
        return 'TOKENS_TO_TOKENS';
    }

    public constructor(tradeStruct: UniswapV2TradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this.deadlineMinutes = tradeStruct.deadlineMinutes;
        this.exact = tradeStruct.exact;
        this.wrappedPath = tradeStruct.wrappedPath;
        this.routPoolInfo = tradeStruct.routPoolInfo;
    }

    protected getAmountInAndAmountOut(): { amountIn: string; amountOut: string } {
        let amountIn = this.fromWithoutFee.stringWeiAmount;
        let amountOut = this.toTokenAmountMin.stringWeiAmount;

        if (this.exact === 'output') {
            amountIn = this.fromWithoutFee.weiAmountPlusSlippage(this.slippageTolerance).toFixed(0);
            amountOut = this.to.stringWeiAmount;
        }

        return { amountIn, amountOut };
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        if (options.supportFee === undefined) {
            const needApprove = await this.needApprove(options.fromAddress);
            if (needApprove) {
                throw new RubicSdkError(
                    'To use `encode` function, token must be approved for wallet'
                );
            }

            try {
                await this.checkBalance();
            } catch (_err) {
                throw new RubicSdkError(
                    'To use `encode` function, wallet must have enough balance or you must provider `supportFee` parameter in options.'
                );
            }
        }

        const methodName = await this.getMethodName(
            options,
            options.fromAddress,
            options.supportFee
        );
        const gasParams = this.getGasParams(options);

        const config = EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            (<typeof UniswapV2AbstractTrade>this.constructor).contractAbi,
            methodName,
            this.getCallParameters(options.receiverAddress || options.fromAddress),
            this.nativeValueToSend,
            gasParams
        );

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }

    protected getSwapError(err: Error & { code: number }): Error {
        if (this.isDeflationError()) {
            throw new LowSlippageDeflationaryTokenError();
        }
        throw parseError(err);
    }

    protected getCallParameters(receiverAddress?: string): unknown[] {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];

        return [
            ...amountParameters,
            this.wrappedPath.map(t => t.address),
            receiverAddress || this.walletAddress,
            this.deadlineMinutesTimestamp
        ];
    }

    protected async getMethodName(
        options: SwapTransactionOptions,
        fromAddress?: string,
        supportFee?: boolean
    ): Promise<string> {
        if (supportFee === false) {
            return this.regularSwapMethod;
        }
        if (supportFee === true) {
            return this.supportedFeeSwapMethod;
        }

        const regularParameters = this.getSwapParametersByMethod(this.regularSwapMethod, options);
        const supportedFeeParameters = this.getSwapParametersByMethod(
            this.supportedFeeSwapMethod,
            options
        );

        const regularMethodResult = await tryExecuteAsync(
            this.web3Public.callContractMethod,
            this.convertSwapParametersToCallParameters(regularParameters, fromAddress)
        );

        const feeMethodResult = await tryExecuteAsync(
            this.web3Public.callContractMethod,
            this.convertSwapParametersToCallParameters(supportedFeeParameters, fromAddress)
        );

        if (regularMethodResult.success) {
            if (feeMethodResult.success) {
                return this.regularSwapMethod;
            }
            throw new LowSlippageDeflationaryTokenError();
        }

        if (feeMethodResult.success) {
            return this.supportedFeeSwapMethod;
        }

        throw parseError(regularMethodResult.error);
    }

    protected getSwapParametersByMethod(
        method: string,
        options: SwapTransactionOptions
    ): Parameters<InstanceType<typeof EvmWeb3Private>['executeContractMethod']> {
        const value = this.nativeValueToSend;

        return [
            this.dexContractAddress,
            (<typeof UniswapV2AbstractTrade>this.constructor).contractAbi,
            method,
            this.getCallParameters(options?.receiverAddress),
            { value }
        ];
    }

    private convertSwapParametersToCallParameters(
        parameters: Parameters<InstanceType<typeof EvmWeb3Private>['executeContractMethod']>,
        fromAddress?: string
    ): Parameters<InstanceType<typeof EvmWeb3Public>['callContractMethod']> {
        return parameters.slice(0, 4).concat([
            {
                from: fromAddress || this.walletAddress,
                ...(parameters[4]?.value && { value: parameters[4]?.value })
            }
        ]) as Parameters<InstanceType<typeof EvmWeb3Public>['callContractMethod']>;
    }

    // /** @internal */
    // public async getEstimatedGasCallData(): Promise<BatchCall> {
    //     return this.encode({ fromAddress: this.walletAddress, supportFee: false });
    // }

    // /** @internal */
    // public getDefaultEstimatedGas(): BigNumber {
    //     const transitTokensNumber = this.wrappedPath.length - 2;
    //     let methodName: keyof DefaultEstimatedGas = 'tokensToTokens';
    //     if (this.from.isNative) {
    //         methodName = 'ethToTokens';
    //     }
    //     if (this.to.isNative) {
    //         methodName = 'tokensToEth';
    //     }

    //     const constructor = <typeof UniswapV2AbstractTrade>this.constructor;
    //     const gasLimitAmount =
    //         constructor.defaultEstimatedGasInfo[methodName]?.[transitTokensNumber];
    //     if (!gasLimitAmount) {
    //         throw new RubicSdkError('Gas limit has to be defined');
    //     }

    //     const gasLimit = gasLimitAmount.toFixed(0);
    //     return new BigNumber(gasLimit);
    // }
}
