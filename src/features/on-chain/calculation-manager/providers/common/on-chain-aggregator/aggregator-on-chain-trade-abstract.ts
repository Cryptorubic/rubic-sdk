import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { EvmOnChainTrade } from '../on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { GetToAmountAndTxDataResponse } from './models/aggregator-on-chain-types';

export abstract class AggregatorOnChaiTrade extends EvmOnChainTrade {
    protected async getTxConfigAndCheckAmount(
        receiverAddress?: string,
        fromAddress?: string,
        directTransaction?: EvmEncodeConfig
    ): Promise<EvmEncodeConfig> {
        if (directTransaction) {
            return directTransaction;
        }

        const { tx, toAmount } = await this.getToAmountAndTxData(receiverAddress, fromAddress);

        const gasLimit = tx.gas && parseInt(tx.gas, 16).toString();
        const gasPrice = tx.gasPrice && parseInt(tx.gasPrice, 16).toString();

        const evmEncodeConfig = {
            data: tx.data,
            to: tx.to,
            value: tx.value,
            gas: gasLimit,
            gasPrice
        };

        const toAmountWei = Web3Pure.toWei(toAmount, this.to.decimals);

        EvmOnChainTrade.checkAmountChange(
            evmEncodeConfig,
            toAmountWei,
            this.toTokenAmountMin.stringWeiAmount
        );

        return evmEncodeConfig;
    }

    /**
     * Returns data for method EvmOnChainTrade.checkAmountChange and EvmEncodeConfig value
     */
    protected abstract getToAmountAndTxData(
        receiverAddress?: string,
        fromAddress?: string
    ): Promise<GetToAmountAndTxDataResponse>;
}
