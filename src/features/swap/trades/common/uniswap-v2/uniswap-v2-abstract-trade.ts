import { tryExecuteAsync } from '@common/utils/functions';
import { DeepReadonly } from '@common/utils/types/deep-readonly';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Injector } from '@core/sdk/injector';
import { GasInfo } from '@features/swap/models/gas-info';
import { InstantTrade } from '@features/swap/models/instant-trade';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { defaultEstimatedGas } from '@features/swap/trades/common/uniswap-v2/constants/default-estimated-gas';
import {
    REGULAR_SWAP_METHOD,
    RegularSwapMethod,
    SupportingFeeMethodsMapping,
    SupportingFeeSwapMethod
} from '@features/swap/trades/common/uniswap-v2/constants/SWAP_METHOD';
import { defaultUniswapV2Abi } from '@features/swap/trades/common/uniswap-v2/constants/uniswap-v2-abi';
import { DefaultEstimatedGas } from '@features/swap/trades/common/uniswap-v2/models/default-estimated-gas';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

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
    public readonly from: DeepReadonly<PriceTokenAmount>;

    public readonly to: DeepReadonly<PriceTokenAmount>;

    public readonly gasInfo: DeepReadonly<GasInfo>;

    public readonly path: DeepReadonly<PriceToken[]>;

    public readonly deadlineMinutes: number;

    public readonly exact: 'input' | 'output';

    public readonly slippageTolerance: number;

    protected abstract contractAddress: string;

    protected contractAbi: AbiItem[] = defaultUniswapV2Abi;

    protected defaultEstimatedGasInfo: DefaultEstimatedGas = defaultEstimatedGas;

    private get deadlineMinutesTimestamp(): number {
        return Math.floor(Date.now() / 1000 + 60 * this.deadlineMinutes);
    }

    protected constructor(tradeStruct: UniswapV2TradeStruct) {
        super();
        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasInfo = tradeStruct.gasInfo;
        this.path = tradeStruct.path;
        this.deadlineMinutes = tradeStruct.deadlineMinutes;
        this.exact = tradeStruct.exact;
        this.slippageTolerance = tradeStruct.slippageTolerance;
    }

    public async swap(options: SwapTransactionOptions = {}) {
        await this.checkSettings();

        if (this.from.isNative) {
            return this.createEthToTokensTrade(options);
        }
        if (this.to.isNative) {
            return this.createTokensToEthTrade(options);
        }
        return this.createTokensToTokensTrade(options);
    }

    private getGasLimit(options: { gasLimit?: string | null }): string {
        if (options.gasLimit) {
            return options.gasLimit;
        }
        if (this.gasInfo.gasLimit) {
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
        if (this.gasInfo.gasPrice) {
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
        this.createAnyToAnyTrade(options, REGULAR_SWAP_METHOD[this.exact].TOKENS_TO_TOKENS);

    private createTokensToEthTrade = (options: SwapTransactionOptions) =>
        this.createAnyToAnyTrade(options, REGULAR_SWAP_METHOD[this.exact].TOKENS_TO_ETH);

    private createEthToTokensTrade = (options: SwapTransactionOptions) => {
        const { amountIn } = this.getAmountInAndAmountOut();
        return this.createAnyToAnyTrade(
            { ...options, value: amountIn },
            REGULAR_SWAP_METHOD[this.exact].TOKENS_TO_ETH
        );
    };

    private async createAnyToAnyTrade(
        options: SwapTransactionOptions & { value?: string },
        swapMethod: RegularSwapMethod
    ): Promise<TransactionReceipt> {
        const { web3Private } = Injector;

        const regularMethodResult = await tryExecuteAsync(
            web3Private.tryExecuteContractMethod,
            this.getSwapParameters(swapMethod, options)
        );

        if (regularMethodResult.success) {
            return regularMethodResult.value;
        }

        return web3Private.tryExecuteContractMethod(
            ...this.getSwapParameters(SupportingFeeMethodsMapping[swapMethod], options)
        );
    }

    private getSwapParameters(
        method: RegularSwapMethod | SupportingFeeSwapMethod,
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
                this.deadlineMinutesTimestamp
            ],
            {
                onTransactionHash: options.onConfirm,
                gas,
                ...(gasPrice && { gasPrice }),
                ...(options.value && { value: options.value })
            }
        ];
    }
}
