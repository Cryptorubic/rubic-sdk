import { tryExecuteAsync } from '@common/utils/functions';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { EncodableSwapTransactionOptions } from '@features/swap/models/encodable-swap-transaction-options';
import { GasInfo } from '@features/swap/models/gas-info';
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
import { TransactionConfig } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { Utils } from '@common/utils/blockchain';

export type UniswapV2TradeStruct = {
    from: PriceTokenAmount;
    to: PriceTokenAmount;
    gasInfo: GasInfo;
    path: PriceToken[];
    deadlineMinutes: number;
    exact: 'input' | 'output';
    slippageTolerance: number;
};

export abstract class UniswapV2AbstractTrade extends InstantTrade {
    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly gasInfo: GasInfo | null;

    public readonly path: ReadonlyArray<PriceToken>;

    public readonly deadlineMinutes: number;

    public readonly exact: 'input' | 'output';

    public readonly slippageTolerance: number;

    protected readonly contractAbi: AbiItem[] = defaultUniswapV2Abi;

    protected readonly swapMethods: ExactInputOutputSwapMethodsList = SWAP_METHOD;

    protected readonly defaultEstimatedGasInfo: DefaultEstimatedGas = defaultEstimatedGas;

    protected constructor(tradeStruct: UniswapV2TradeStruct) {
        super(tradeStruct.from.blockchain);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasInfo = tradeStruct.gasInfo;
        this.path = tradeStruct.path;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
        this.exact = tradeStruct.exact;
        this.slippageTolerance = tradeStruct.slippageTolerance;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<TransactionReceipt> {
        await this.checkWalletState();

        if (this.from.isNative) {
            return this.createEthToTokensTrade(options);
        }
        if (this.to.isNative) {
            return this.createTokensToEthTrade(options);
        }
        return this.createTokensToTokensTrade(options);
    }

    public encode(options: EncodableSwapTransactionOptions): TransactionConfig {
        if (this.from.isNative) {
            return this.encodeEthToTokensTrade(options);
        }
        if (this.to.isNative) {
            return this.encodeTokensToEthTrade(options);
        }
        return this.encodeTokensToTokensTrade(options);
    }

    private getGasLimit(options: { gasLimit?: string | null }): string {
        if (options.gasLimit) {
            return options.gasLimit;
        }
        if (this.gasInfo) {
            return this.gasInfo.gasLimit;
        }

        const transitTokensNumber = this.path.length - 2;
        let methodName: keyof DefaultEstimatedGas = 'tokensToTokens';
        if (this.from.isNative) {
            methodName = 'ethToTokens';
        }
        if (this.to.isNative) {
            methodName = 'tokensToEth';
        }

        return this.defaultEstimatedGasInfo[methodName][transitTokensNumber].toFixed(0);
    }

    private getGasPrice(options: { gasPrice?: string | null }): string | null {
        if (options.gasPrice) {
            return options.gasPrice;
        }
        if (this.gasInfo) {
            return this.gasInfo.gasPrice;
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

    private createTokensToTokensTrade = (options: SwapTransactionOptions) =>
        this.createAnyToAnyTrade(options, 'TOKENS_TO_TOKENS');

    private createTokensToEthTrade = (options: SwapTransactionOptions) =>
        this.createAnyToAnyTrade(options, 'TOKENS_TO_ETH');

    private createEthToTokensTrade = (options: SwapTransactionOptions) => {
        const { amountIn } = this.getAmountInAndAmountOut();
        return this.createAnyToAnyTrade({ ...options, value: amountIn }, 'TOKENS_TO_ETH');
    };

    private encodeTokensToTokensTrade = (options: EncodableSwapTransactionOptions) =>
        this.encodeAnyToAnyTrade(options, 'TOKENS_TO_TOKENS');

    private encodeTokensToEthTrade = (options: EncodableSwapTransactionOptions) =>
        this.encodeAnyToAnyTrade(options, 'TOKENS_TO_ETH');

    private encodeEthToTokensTrade = (options: EncodableSwapTransactionOptions) => {
        const { amountIn } = this.getAmountInAndAmountOut();
        return this.encodeAnyToAnyTrade({ ...options, value: amountIn }, 'TOKENS_TO_ETH');
    };

    private async createAnyToAnyTrade(
        options: SwapTransactionOptions & { value?: string },
        swapMethod: RegularSwapMethod
    ): Promise<TransactionReceipt> {
        const regularMethodResult = await tryExecuteAsync(
            this.web3Private.tryExecuteContractMethod,
            this.getSwapParameters(this.swapMethods[this.exact][swapMethod], options)
        );

        if (regularMethodResult.success) {
            return regularMethodResult.value;
        }

        return this.web3Private.tryExecuteContractMethod(
            ...this.getSwapParameters(
                this.swapMethods[this.exact][SUPPORTING_FEE_SWAP_METHODS_MAPPING[swapMethod]],
                options
            )
        );
    }

    private getSwapParameters(
        method: string,
        options: SwapTransactionOptions & { value?: string }
    ): Parameters<InstanceType<typeof Web3Private>['tryExecuteContractMethod']> {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();

        const gasPrice = this.getGasPrice(options);
        const gas = this.getGasLimit(options);

        return [
            this.contractAddress,
            this.contractAbi,
            method,
            [
                amountIn,
                amountOut,
                this.path.map(t => t.address),
                this.to.address,
                Utils.deadlineMinutesTimestamp(this.deadlineMinutes)
            ],
            {
                onTransactionHash: options.onConfirm,
                gas,
                ...(gasPrice && { gasPrice }),
                ...(options.value && { value: options.value })
            }
        ];
    }

    private encodeAnyToAnyTrade(
        options: EncodableSwapTransactionOptions & { value?: string },
        swapMethod: RegularSwapMethod
    ): TransactionConfig {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const method = this.swapMethods[this.exact][swapMethod];
        const parameters = [
            amountIn,
            amountOut,
            this.path.map(t => t.address),
            this.to.address,
            Utils.deadlineMinutesTimestamp(this.deadlineMinutes)
        ];
        const gasPrice = this.getGasPrice(options);
        const gasLimit = this.getGasLimit(options);
        return Web3Pure.encodeMethodCall(
            this.contractAddress,
            this.contractAbi,
            method,
            parameters,
            options.value,
            { gasLimit, gasPrice }
        );
    }
}
