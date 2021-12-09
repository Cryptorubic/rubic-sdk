import { tryExecuteAsync } from '@common/utils/functions';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { Injector } from '@core/sdk/injector';
import { EncodableSwapTransactionOptions } from '@features/swap/models/encodable-swap-transaction-options';
import { FeeInfo } from '@features/swap/models/fee-info';
import { EstimatedGasCallData } from '@features/swap/trades/common/uniswap-v2/models/estimated-gas-call-data';
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

export type UniswapV2TradeStruct = {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    exact: 'input' | 'output';
    path: ReadonlyArray<Token> | Token[];
    gasInfo?: FeeInfo;
    deadlineMinutes?: number;
    slippageTolerance?: number;
};

export abstract class UniswapV2AbstractTrade extends InstantTrade {
    static readonly contractAbi: AbiItem[] = defaultUniswapV2Abi;

    static readonly swapMethods: ExactInputOutputSwapMethodsList = SWAP_METHOD;

    static readonly defaultEstimatedGasInfo: DefaultEstimatedGas = defaultEstimatedGas;

    public deadlineMinutes: number;

    public slippageTolerance: number;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public feeInfo: FeeInfo | null;

    public readonly path: ReadonlyArray<Token>;

    public readonly exact: 'input' | 'output';

    public set settings(value: { deadlineMinutes?: number; slippageTolerance?: number }) {
        this.deadlineMinutes = value.deadlineMinutes || this.deadlineMinutes;
        this.slippageTolerance = value.slippageTolerance || this.slippageTolerance;
    }

    private get deadlineMinutesTimestamp(): number {
        return Math.floor(Date.now() / 1000 + 60 * this.deadlineMinutes);
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

    constructor(tradeStruct: UniswapV2TradeStruct) {
        super();
        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.feeInfo = tradeStruct.gasInfo || null;
        this.path = tradeStruct.path;
        this.deadlineMinutes = tradeStruct.deadlineMinutes || 1; // TODO: default child config
        this.exact = tradeStruct.exact;
        this.slippageTolerance = tradeStruct.slippageTolerance || 1; // TODO: default child config
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkSettings();

        return this.createAnyToAnyTrade(options);
    }

    public encode(options: EncodableSwapTransactionOptions): TransactionConfig {
        return this.encodeAnyToAnyTrade(options);
    }

    public getEstimatedGasCallData(): EstimatedGasCallData {
        return this.estimateGasFroAnyToAnyTrade();
    }

    private getGasLimit(options?: { gasLimit?: string | null }): string {
        if (options?.gasLimit) {
            return options.gasLimit;
        }
        if (this.feeInfo?.gasLimit?.isFinite()) {
            return this.feeInfo.gasLimit.toFixed(0);
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
        if (this.feeInfo?.gasPrice?.isFinite()) {
            return this.feeInfo.gasPrice.toFixed(0);
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
        const { web3Private } = Injector;

        const regularMethodResult = await tryExecuteAsync(
            web3Private.tryExecuteContractMethod,
            this.getSwapParameters(this.regularSwapMethod, options)
        );

        if (regularMethodResult.success) {
            return regularMethodResult.value;
        }

        return web3Private.tryExecuteContractMethod(
            ...this.getSwapParameters(this.supportedFeeSwapMethod, options)
        );
    }

    private getSwapParameters(
        method: string,
        options: SwapTransactionOptions & { value?: string }
    ): Parameters<InstanceType<typeof Web3Private>['tryExecuteContractMethod']> {
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

    private encodeAnyToAnyTrade(options: EncodableSwapTransactionOptions): TransactionConfig {
        const gasPrice = this.getGasPrice(options);
        const gasLimit = this.getGasLimit(options);

        return Web3Pure.encodeMethodCall(
            this.contractAddress,
            (<typeof UniswapV2AbstractTrade>this.constructor).contractAbi,
            this.regularSwapMethod,
            this.callParameters,
            this.nativeValueToSend,
            { gasLimit, gasPrice }
        );
    }

    private estimateGasFroAnyToAnyTrade(): EstimatedGasCallData {
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
