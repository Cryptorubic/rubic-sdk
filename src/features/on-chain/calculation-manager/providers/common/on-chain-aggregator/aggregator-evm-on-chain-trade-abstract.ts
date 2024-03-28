import BigNumber from 'bignumber.js';
import { TokenUtils } from 'src/common/utils/token-utils';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

import { EvmOnChainTrade } from '../on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export abstract class AggregatorEvmOnChainTrade extends EvmOnChainTrade {
    public async getTxConfigAndCheckAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodeConfig> {
        if (this.lastTransactionConfig && options.useCacheData) {
            return this.lastTransactionConfig;
        }

        const { tx, toAmount } = await this.getTransactionConfigAndAmount(options);

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

        if (!options.skipAmountCheck) {
            this.checkAmountChange(newToTokenAmountMin, this.toTokenAmountMin.stringWeiAmount);
        }

        return config;
    }
}
