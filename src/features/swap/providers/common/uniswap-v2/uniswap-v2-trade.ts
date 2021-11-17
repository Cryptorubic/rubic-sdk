import { cloneObject } from '@common/utils/object';
import { TokenAmount } from '@core/blockchain/models/token-amount';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { GasInfo } from '@features/swap/models/gas-info';
import { InstantTrade } from '@features/swap/models/instant-trade';
import { SwapTransactionOptions } from '@features/swap/models/swap-transaction-options';
import { InternalUniswapV2Trade } from '@features/swap/providers/common/uniswap-v2/models/uniswap-v2-trade';
import BigNumber from 'bignumber.js';
import { DeepReadonly } from 'ts-essentials';

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

    constructor(
        private readonly web3Public: Web3Public,
        private readonly web3Private: Web3Private,
        private readonly _from: TokenAmount,
        public readonly _gasInfo: GasInfo,
        public readonly _to: TokenAmount
    ) {
        super();
    }

    public async swap(options: SwapTransactionOptions = {}) {
        // this.providerConnectorService.checkSettings(trade.blockchain);

        await this.web3Public.checkBalance(this.from.token, this.from.amount, this.walletAddress);

        let amountIn = Web3Public.toWei(trade.from.amount, trade.from.token.decimals);
        let amountOut = Web3Public.toWei(
            trade.to.amount.multipliedBy(new BigNumber(1).minus(trade.slippageTolerance)),
            trade.to.token.decimals
        );

        if (trade.exact === 'input') {
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
