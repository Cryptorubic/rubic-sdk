import BigNumber from 'bignumber.js';
import { TokenUtils } from 'src/common/utils/token-utils';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

import { EvmOnChainTrade } from '../on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export abstract class AggregatorEvmOnChainTrade extends EvmOnChainTrade {
    protected async getTxConfigAndCheckAmount(
        receiverAddress?: string,
        fromAddress?: string,
        directTransaction?: EvmEncodeConfig
    ): Promise<EvmEncodeConfig> {
        if (directTransaction) {
            return directTransaction;
        }

        const { tx, toAmount } = await this.getTransactionConfigAndAmount(
            receiverAddress,
            fromAddress
        );

        const gasLimit = tx.gas && parseInt(tx.gas, 16).toString();
        const gasPrice = tx.gasPrice && parseInt(tx.gasPrice, 16).toString();

        const evmEncodeConfig = {
            data: tx.data,
            to: tx.to,
            value: tx.value,
            gas: gasLimit,
            gasPrice
        };

        const newToTokenAmountMin = TokenUtils.getMinWeiAmountString(
            new BigNumber(toAmount),
            this.slippageTolerance
        );

        this.checkAmountChange(newToTokenAmountMin, this.toTokenAmountMin.stringWeiAmount);

        return evmEncodeConfig;
    }
}
