import { DeepReadonly } from '@common/utils/types/deep-readonly';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Injector } from '@core/sdk/injector';
import { GasInfo } from '@features/swap/models/gas-info';
import { InstantTrade } from '@features/swap/models/instant-trade';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { defaultEstimatedGas } from '@features/swap/providers/common/uniswap-v2/constants/default-estimated-gas';
import {
    SWAP_METHOD,
    SwapMethod
} from '@features/swap/providers/common/uniswap-v2/constants/SWAP_METHOD';
import { defaultUniswapV2Abi } from '@features/swap/providers/common/uniswap-v2/constants/uniswap-v2-abi';
import { DefaultEstimatedGas } from '@features/swap/providers/common/uniswap-v2/models/default-estimated-gas';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

export abstract class UniswapV2Trade extends InstantTrade {
    public gasInfo: DeepReadonly<GasInfo>;

    public readonly exact: 'input' | 'output';

    public path: DeepReadonly<PriceToken[]>;

    public readonly deadlineMinutes: number;

    protected abstract contractAddress: string;

    protected contractAbi: AbiItem[] = defaultUniswapV2Abi;

    protected defaultEstimatedGasInfo: DefaultEstimatedGas = defaultEstimatedGas;

    private get defaultEstimatedGas(): number {

    }

    private get deadlineMinutesTimestamp(): number {
        return Math.floor(Date.now() / 1000 + 60 * this.deadlineMinutes);
    }

    protected constructor(
        public from: DeepReadonly<PriceTokenAmount>,
        public to: DeepReadonly<PriceTokenAmount>,
        public gasInfo: DeepReadonly<GasInfo>
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

    private createTokensToEthTrade = (options: ItOptions) =>
        this.createAnyToAnyTrade(options, SWAP_METHOD[this.exact].TOKENS_TO_ETH);

    private createAnyToAnyTrade(
        options: ItOptions & { value?: number },
        swapMethod: SwapMethod
    ): Promise<TransactionReceipt> {
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
    }
}
