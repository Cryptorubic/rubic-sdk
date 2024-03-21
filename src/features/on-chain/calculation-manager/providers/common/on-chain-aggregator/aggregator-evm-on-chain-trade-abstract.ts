import BigNumber from 'bignumber.js';
import { TokenUtils } from 'src/common/utils/token-utils';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

import { EvmOnChainTrade } from '../on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export abstract class AggregatorEvmOnChainTrade extends EvmOnChainTrade {
    public async getTxConfigAndCheckAmount(
        skipAmountChangeCheck: boolean,
        useCacheData: boolean,
        receiverAddress?: string,
        fromAddress?: string
    ): Promise<EvmEncodeConfig> {
        if (this.lastTransactionConfig && useCacheData) {
            return this.lastTransactionConfig;
        }

        const { tx, toAmount } = await this.getTransactionConfigAndAmount(
            receiverAddress,
            fromAddress
        );

        const gasLimit = tx.gas && parseInt(tx.gas, 16).toString();
        const gasPrice = tx.gasPrice && parseInt(tx.gasPrice, 16).toString();

        const config = {
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

        this.lastTransactionConfig = config;
        setTimeout(() => {
            this.lastTransactionConfig = null;
        }, 15_000);

        if (!skipAmountChangeCheck) {
            this.checkAmountChange(newToTokenAmountMin, this.toTokenAmountMin.stringWeiAmount);
        }

        return config;
    }
}
