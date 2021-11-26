import { cloneObject } from '@common/utils/object';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Injector } from '@core/sdk/injector';
import { GasInfo } from '@features/swap/models/gas-info';
import { InstantTrade } from '@features/swap/models/instant-trade';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import {
    SWAP_METHOD,
    SwapMethod
} from '@features/swap/providers/common/uniswap-v2/constants/SWAP_METHOD';
import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';

export class UniswapV2Trade extends InstantTrade {
    public gasInfo: {
        gasLimit: string | null;
        gasPrice: string | null;
        gasFeeInUsd: BigNumber | null;
        gasFeeInEth: BigNumber | null;
    };

    public readonly exact: 'input' | 'output';

    public readonly path: PriceToken[];

    public readonly deadlineMinutes: number;

    protected contractAddress: string;

    protected contractAbi: AbiItem[];

    public get to(): PriceTokenAmount {
        return cloneObject(this._to);
    }

    public get from(): PriceTokenAmount {
        return cloneObject(this._from);
    }

    private get deadlineMinutesTimestamp(): number {
        return Math.floor(Date.now() / 1000 + 60 * this.deadlineMinutes);
    }

    constructor(
        private readonly _from: PriceTokenAmount,
        public readonly _gasInfo: GasInfo,
        public readonly _to: PriceTokenAmount
    ) {
        super();
    }

    public async swap(options: SwapTransactionOptions = {}) {
        await this.checkSettings();
        const web3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);

        let amountIn = this.from.weiAmount;
        let amountOut = this.toTokenAmountMin.weiAmount;

        if (this.exact === 'output') {
            amountIn = this.from.weiAmountPlusSlippage(this.slippageTolerance);
            amountOut = this.to.weiAmount;
        }

        let defaultGasLimit = this.defaultEstimateGas.tokensToTokens[trade.path.length - 2];
        let createTradeMethod = this.createTokensToTokensTrade;
        if (Web3Public.isNativeAddress(trade.from.token.address)) {
            createTradeMethod = this.createEthToTokensTrade;
            defaultGasLimit = this.defaultEstimateGas.ethToTokens[trade.path.length - 2];
        }
        if (Web3Public.isNativeAddress(trade.to.token.address)) {
            createTradeMethod = this.createTokensToEthTrade;
            defaultGasLimit = this.defaultEstimateGas.tokensToEth[trade.path.length - 2];
        }
        options.gasLimit ||= trade.gasInfo.gasLimit || defaultGasLimit.toFixed(0);
        options.gasPrice ||= trade.gasInfo.gasPrice;

        return createTradeMethod(uniswapV2Trade, options as SwapTransactionOptionsWithGasLimit);
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

    private createTokensToTokensTrade = (options: ItOptions) => {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const { web3Private } = Injector;

        return web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.contractAbi,
            SWAP_METHOD[this.exact].TOKENS_TO_TOKENS,
            [
                amountIn,
                amountOut,
                this.path.map(t => t.address),
                this.to.address,
                this.deadlineMinutesTimestamp
            ],
            {
                onTransactionHash: options.onConfirm,
                gas: options.gasLimit,
                gasPrice: options.gasPrice
            }
        );
    };

    private createTokensToEthTrade = (options: ItOptions) => {
        this.createAnyToAnyTrade(options, SWAP_METHOD[this.exact].TOKENS_TO_ETH);
    };

    private createAnyToAnyTrade = (
        options: ItOptions & { value?: number },
        swapMethod: SwapMethod
    ) => {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const { web3Private } = Injector;

        return web3Private.tryExecuteContractMethod(
            this.contractAddress,
            this.contractAbi,
            swapMethod,
            [
                amountIn,
                amountOut,
                this.path.map(t => t.address),
                this.to.address,
                this.deadlineMinutesTimestamp
            ],
            {
                onTransactionHash: options.onConfirm,
                gas: options.gasLimit,
                gasPrice: options.gasPrice,
                ...(options.value && { value: options.value })
            }
        );
    };
}
