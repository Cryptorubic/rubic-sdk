import { LowSlippageDeflationaryTokenError } from '@common/errors/swap/low-slippage-deflationary-token.error';
import { LowSlippageError } from '@common/errors/swap/low-slippage.error';
import { tryExecuteAsync } from '@common/utils/functions';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { ContractMulticallResponse } from '@core/blockchain/web3-public/models/contract-multicall-response';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { GasFeeInfo } from '@features/swap/models/gas-fee-info';
import { Injector } from '@core/sdk/injector';
import { EstimatedGasCallData } from '@features/swap/trades/common/uniswap-v2/models/estimated-gas-call-data';
import { UniswapEncodableSwapTransactionOptions } from '@features/swap/trades/common/uniswap-v2/models/uniswap-encodable-swap-transaction-options';
import { InstantTrade } from '@features/swap/trades/instant-trade';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { defaultEstimatedGas } from '@features/swap/providers/common/uniswap-v2-abstract-provider/constants/default-estimated-gas';
import {
    ExactInputOutputSwapMethodsList,
    RegularSwapMethod,
    SUPPORTING_FEE_SWAP_METHODS_MAPPING,
    SWAP_METHOD
} from '@features/swap/providers/common/uniswap-v2-abstract-provider/constants/SWAP_METHOD';

import { defaultUniswapV2Abi } from '@features/swap/providers/common/uniswap-v2-abstract-provider/constants/uniswap-v2-abi';
import { DefaultEstimatedGas } from '@features/swap/providers/common/uniswap-v2-abstract-provider/models/default-estimated-gas';
import BigNumber from 'bignumber.js';
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { deadlineMinutesTimestamp } from '@common/utils/blockchain';

export type UniswapV2TradeStruct = {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    exact: 'input' | 'output';
    path: ReadonlyArray<Token> | Token[];
    deadlineMinutes: number;
    slippageTolerance: number;
    gasFeeInfo?: GasFeeInfo | null;
};

export abstract class UniswapV2AbstractTrade extends InstantTrade {
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
        return web3Public.multicallContractMethods<{ amounts: string[] }>(
            this.getContractAddress(),
            this.contractAbi,
            routesMethodArguments.map(methodArguments => ({
                methodName,
                methodArguments
            }))
        );
    }

    public deadlineMinutes: number;

    public slippageTolerance: number;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public gasFeeInfo: GasFeeInfo | null;

    public readonly path: ReadonlyArray<Token>;

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

        return [
            amountIn,
            amountOut,
            this.path.map(t => t.address),
            this.to.address,
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
        this.path = tradeStruct.path;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
        this.exact = tradeStruct.exact;
        this.slippageTolerance = tradeStruct.slippageTolerance;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        return this.createAnyToAnyTrade(options);
    }

    public encode(options: UniswapEncodableSwapTransactionOptions): TransactionConfig {
        return this.encodeAnyToAnyTrade(options);
    }

    public getEstimatedGasCallData(): EstimatedGasCallData {
        return this.estimateGasForAnyToAnyTrade();
    }

    private getGasLimit(options?: { gasLimit?: string | null }): string {
        if (options?.gasLimit) {
            return options.gasLimit;
        }
        if (this.gasFeeInfo?.gasLimit?.isFinite()) {
            return this.gasFeeInfo.gasLimit.toFixed(0);
        }

        const transitTokensNumber = this.path.length - 2;
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

    private getGasPrice(options: { gasPrice?: string | null }): string | null {
        if (options.gasPrice) {
            return options.gasPrice;
        }
        if (this.gasFeeInfo?.gasPrice?.isFinite()) {
            return this.gasFeeInfo.gasPrice.toFixed(0);
        }
        return null;
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

    private async createAnyToAnyTrade(
        options: SwapTransactionOptions
    ): Promise<TransactionReceipt> {
        const regularParameters = this.getSwapParameters(this.regularSwapMethod, options);
        const supportedFeeParameters = this.getSwapParameters(this.supportedFeeSwapMethod, options);

        const regularMethodResult = await tryExecuteAsync(
            this.web3Public.callContractMethod,
            this.convertSwapParametersToCallParameters(regularParameters)
        );

        const feeMethodResult = await tryExecuteAsync(
            this.web3Public.callContractMethod,
            this.convertSwapParametersToCallParameters(supportedFeeParameters)
        );

        if (regularMethodResult.success) {
            if (feeMethodResult.success) {
                return this.web3Private.executeContractMethod(...regularParameters);
            }
            throw new LowSlippageDeflationaryTokenError();
        }

        if (feeMethodResult.success) {
            return this.web3Private.executeContractMethod(...supportedFeeParameters);
        }

        throw new LowSlippageError();
    }

    private getSwapParameters(
        method: string,
        options: SwapTransactionOptions & { value?: string }
    ): Parameters<InstanceType<typeof Web3Private>['executeContractMethod']> {
        const gasPrice = this.getGasPrice(options);
        const gas = this.getGasLimit(options);
        const value = this.nativeValueToSend;

        return [
            this.contractAddress,
            (<typeof UniswapV2AbstractTrade>this.constructor).contractAbi,
            method,
            this.callParameters,
            {
                onTransactionHash: options.onConfirm,
                gas,
                ...(gasPrice && { gasPrice }),
                ...(value && { value })
            }
        ];
    }

    private convertSwapParametersToCallParameters(
        parameters: Parameters<InstanceType<typeof Web3Private>['executeContractMethod']>
    ): Parameters<InstanceType<typeof Web3Public>['callContractMethod']> {
        return parameters.slice(0, 2).concat([
            {
                methodArguments: parameters[3],
                from: this.web3Private.address,
                ...(parameters[4]?.value && { value: parameters[4]?.value })
            }
        ]) as Parameters<InstanceType<typeof Web3Public>['callContractMethod']>;
    }

    private encodeAnyToAnyTrade(
        options: UniswapEncodableSwapTransactionOptions
    ): TransactionConfig {
        const gasPrice = this.getGasPrice(options);
        const gasLimit = this.getGasLimit(options);

        return Web3Pure.encodeMethodCall(
            this.contractAddress,
            (<typeof UniswapV2AbstractTrade>this.constructor).contractAbi,
            options?.useDeflationaryTokenMethod
                ? this.supportedFeeSwapMethod
                : this.regularSwapMethod,
            this.callParameters,
            this.nativeValueToSend,
            { gasLimit, gasPrice }
        );
    }

    private estimateGasForAnyToAnyTrade(): EstimatedGasCallData {
        const defaultGasLimit = new BigNumber(this.getGasLimit());
        const value = this.nativeValueToSend;
        return {
            defaultGasLimit,
            callData: {
                contractMethod: this.regularSwapMethod,
                params: this.callParameters,
                ...(value && { value })
            }
        };
    }
}
