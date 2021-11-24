import { cloneObject } from '@common/utils/object';
import { TokenAmount } from '@core/blockchain/tokens/token-amount';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { Injector } from '@core/sdk/injector';
import { GasInfo } from '@features/swap/models/gas-info';
import { InstantTrade } from '@features/swap/models/instant-trade';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { InternalUniswapV2Trade } from '@features/swap/providers/common/uniswap-v2/models/uniswap-v2-trade';
import BigNumber from 'bignumber.js';

export class UniswapV2Trade extends InstantTrade {
    public get to(): TokenAmount {
        return cloneObject(this._to);
    }

    public get from(): TokenAmount {
        return cloneObject(this._from);
    }

    public gasInfo: {
        gasLimit: string | null;
        gasPrice: string | null;
        gasFeeInUsd: BigNumber | null;
        gasFeeInEth: BigNumber | null;
    };

    public exact: 'input' | 'output';

    constructor(
        private readonly _from: TokenAmount,
        public readonly _gasInfo: GasInfo,
        public readonly _to: TokenAmount
    ) {
        super();
    }

    public async swap(options: SwapTransactionOptions = {}) {
        await this.checkSettings();
        const web3Public = Injector.web3PublicService.getWeb3Public(this.from.token.blockchain);

        let amountIn = this.from.weiAmount;
        let amountOut = this.toTokenAmountMin.weiAmount;

        if (this.exact === 'output') {
            amountIn = Web3Public.toWei(
                trade.from.amount.multipliedBy(new BigNumber(1).minus(trade.slippageTolerance)),
                trade.from.token.decimals
            );

            amountOut = Web3Public.toWei(trade.to.amount, trade.to.token.decimals);
        }

        const uniswapV2Trade: InternalUniswapV2Trade = {
            amountIn,
            amountOut,
            path: trade.path,
            to: this.walletAddress,
            exact: trade.exact,
            deadline: Math.floor(Date.now() / 1000) + 60 * trade.deadline
        };

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
}
