import { Cache } from '@common/decorators/cache.decorator';
import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { LowSlippageDeflationaryTokenError } from '@common/errors/swap/low-slippage-deflationary-token.error';
import { LowSlippageError } from '@common/errors/swap/low-slippage.error';
import { tryExecuteAsync } from '@common/utils/functions';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { BatchCall } from '@core/blockchain/web3-public/models/batch-call';
import { ContractMulticallResponse } from '@core/blockchain/web3-public/models/contract-multicall-response';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from '@features/swap/dexes/common/utils/token-native-address-proxy';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';
import { Injector } from '@core/sdk/injector';
import { InstantTrade } from '@features/swap/instant-trade';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { defaultEstimatedGas } from '@features/swap/dexes/common/uniswap-v2-abstract/constants/default-estimated-gas';
import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethod,
    SUPPORTING_FEE_SWAP_METHODS_MAPPING,
    SWAP_METHOD
} from '@features/swap/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';

import { defaultUniswapV2Abi } from '@features/swap/dexes/common/uniswap-v2-abstract/constants/uniswap-v2-abi';
import { DefaultEstimatedGas } from '@features/swap/dexes/common/uniswap-v2-abstract/models/default-estimated-gas';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { EncodeFromAddressTransactionOptions } from '@features/swap/models/encode-transaction-options';
import { deadlineMinutesTimestamp } from 'src/common/utils/options';

export type UniswapV2TradeStruct = {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    exact: 'input' | 'output';
    nativeSupportedPath: ReadonlyArray<Token> | Token[];
    deadlineMinutes: number;
    slippageTolerance: number;
    gasFeeInfo?: GasFeeInfo | null;
};

export abstract class UniswapV2AbstractTrade extends InstantTrade {
    @Cache
    public static getContractAddress(blockchain: BLOCKCHAIN_NAME): string {
        try {
            // see  https://github.com/microsoft/TypeScript/issues/34516
            // @ts-ignore
            const instance = new this({
                from: { blockchain },
                nativeSupportedPath: [{ isNative: () => false }, { isNative: () => false }]
            });
            if (!instance.contractAddress) {
                throw new RubicSdkError('Trying to read abstract class field');
            }
            return instance.contractAddress;
        } catch (e) {
            console.debug(e);
            throw new RubicSdkError('Trying to read abstract class field');
        }
    }

    public static readonly contractAbi: AbiItem[] = defaultUniswapV2Abi;

    public static readonly swapMethods: ExactInputOutputSwapMethodsList = SWAP_METHOD;

    public static readonly defaultEstimatedGasInfo: DefaultEstimatedGas = defaultEstimatedGas;

    public static callForRoutes(
        blockchain: BLOCKCHAIN_NAME,
        exact: 'input' | 'output',
        routesMethodArguments: [string, string[]][]
    ): Promise<ContractMulticallResponse<{ amounts: string[] }>[]> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        const methodName = exact === 'input' ? 'getAmountsOut' : 'getAmountsIn';
        return web3Public.multicallContractMethod<{ amounts: string[] }>(
            this.getContractAddress(blockchain),
            this.contractAbi,
            methodName,
            routesMethodArguments
        );
    }

    public deadlineMinutes: number;

    public slippageTolerance: number;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public gasFeeInfo: GasFeeInfo | null;

    public readonly path: ReadonlyArray<Token>;

    private readonly nativeSupportedPath: ReadonlyArray<Token>;

    public readonly exact: 'input' | 'output';

    public set settings(value: { deadlineMinutes?: number; slippageTolerance?: number }) {
        this.deadlineMinutes = value.deadlineMinutes || this.deadlineMinutes;
        this.slippageTolerance = value.slippageTolerance || this.slippageTolerance;
    }

    private get deadlineMinutesTimestamp(): number {
        return deadlineMinutesTimestamp(this.deadlineMinutes);
    }

    private get nativeValueToSend(): string | undefined {
        if (this.from.isNative) {
            return this.getAmountInAndAmountOut().amountIn;
        }
        return undefined;
    }

    private get callParameters() {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];

        return [
            ...amountParameters,
            this.nativeSupportedPath.map(t => t.address),
            this.walletAddress,
            this.deadlineMinutesTimestamp
        ];
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

    protected constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
        this.exact = tradeStruct.exact;
        this.slippageTolerance = tradeStruct.slippageTolerance;

        this.nativeSupportedPath = tradeStruct.nativeSupportedPath;

        this.path = createTokenNativeAddressProxyInPathStartAndEnd(
            this.nativeSupportedPath,
            Web3Pure.nativeTokenAddress
        );
    }

    private getAmountInAndAmountOut(): { amountIn: string; amountOut: string } {
        let amountIn = this.from.stringWeiAmount;
        let amountOut = this.toTokenAmountMin.stringWeiAmount;

        if (this.exact === 'output') {
            amountIn = this.from.weiAmountPlusSlippage(this.slippageTolerance).toFixed(0);
            amountOut = this.to.stringWeiAmount;
        }

        return { amountIn, amountOut };
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        await this.checkAllowanceAndApprove(options);

        return this.createAnyToAnyTrade(options);
    }

    private async createAnyToAnyTrade(
        options: SwapTransactionOptions
    ): Promise<TransactionReceipt> {
        const methodName = await this.getMethodName(options);
        const swapParameters = this.getSwapParametersByMethod(methodName, options);

        return Injector.web3Private.executeContractMethod(...swapParameters);
    }

    public encode(options: EncodeFromAddressTransactionOptions): Promise<TransactionConfig> {
        return this.encodeAnyToAnyTrade(options);
    }

    private async encodeAnyToAnyTrade(
        options: EncodeFromAddressTransactionOptions
    ): Promise<TransactionConfig> {
        const methodName = await this.getMethodName(options, options.fromAddress);
        const gasParams = this.getGasParams(options);

        return Web3Pure.encodeMethodCall(
            this.contractAddress,
            (<typeof UniswapV2AbstractTrade>this.constructor).contractAbi,
            methodName,
            this.callParameters,
            this.nativeValueToSend,
            gasParams
        );
    }

    private async getMethodName(
        options: SwapTransactionOptions,
        fromAddress?: string
    ): Promise<string> {
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

        throw new LowSlippageError();
    }

    private getSwapParametersByMethod(
        method: string,
        options: SwapTransactionOptions
    ): Parameters<InstanceType<typeof Web3Private>['executeContractMethod']> {
        const value = this.nativeValueToSend;
        const { gas, gasPrice } = this.getGasParams(options);

        return [
            this.contractAddress,
            (<typeof UniswapV2AbstractTrade>this.constructor).contractAbi,
            method,
            this.callParameters,
            {
                onTransactionHash: options.onConfirm,
                value,
                gas,
                gasPrice
            }
        ];
    }

    private convertSwapParametersToCallParameters(
        parameters: Parameters<InstanceType<typeof Web3Private>['executeContractMethod']>,
        fromAddress?: string
    ): Parameters<InstanceType<typeof Web3Public>['callContractMethod']> {
        return parameters.slice(0, 3).concat([
            {
                methodArguments: parameters[3],
                from: fromAddress || Injector.web3Private.address,
                ...(parameters[4]?.value && { value: parameters[4]?.value })
            }
        ]) as Parameters<InstanceType<typeof Web3Public>['callContractMethod']>;
    }

    public getEstimatedGasCallData(): BatchCall {
        return this.estimateGasForAnyToAnyTrade();
    }

    public getDefaultEstimatedGas(): BigNumber {
        return new BigNumber(this.getGasLimit());
    }

    private estimateGasForAnyToAnyTrade(): BatchCall {
        const value = this.nativeValueToSend;
        return {
            contractMethod: this.regularSwapMethod,
            params: this.callParameters,
            ...(value && { value })
        };
    }

    protected getGasLimit(options?: { gasLimit?: string | null }): string {
        const gasLimit = super.getGasLimit(options);
        if (gasLimit) {
            return gasLimit;
        }

        const transitTokensNumber = this.nativeSupportedPath.length - 2;
        let methodName: keyof DefaultEstimatedGas = 'tokensToTokens';
        if (this.from.isNative) {
            methodName = 'ethToTokens';
        }
        if (this.to.isNative) {
            methodName = 'tokensToEth';
        }

        return (<typeof UniswapV2AbstractTrade>this.constructor).defaultEstimatedGasInfo[
            methodName
        ][transitTokensNumber].toFixed(0);
    }
}
