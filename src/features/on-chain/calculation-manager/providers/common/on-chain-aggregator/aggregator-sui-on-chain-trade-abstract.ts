import BigNumber from 'bignumber.js';
import { TokenUtils } from 'src/common/utils/token-utils';
import { SuiEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/sui-web3-pure/sui-encode-config';
import { SuiOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/sui-on-chain-trade/sui-on-chain-trade';

import { SuiEncodedConfigAndToAmount } from './models/aggregator-on-chain-types';

export abstract class AggregatorSuiOnChainTrade extends SuiOnChainTrade {
    protected async getTxConfigAndCheckAmount(
        receiverAddress?: string,
        fromAddress?: string,
        skipAmountCheck: boolean = false
    ): Promise<SuiEncodeConfig> {
        const { tx, toAmount } = await this.getToAmountAndTxData(receiverAddress, fromAddress);

        const encodeConfig = {
            transaction: tx.transaction
        };

        const newToTokenAmountMin = TokenUtils.getMinWeiAmountString(
            new BigNumber(toAmount),
            this.slippageTolerance
        );

        if (!skipAmountCheck) {
            this.checkAmountChange(newToTokenAmountMin, this.toTokenAmountMin.stringWeiAmount);
        }

        return encodeConfig;
    }

    /**
     * @description Returns data for method OnChainTrade.checkAmountChange and EvmEncodeConfig value
     */
    protected abstract getToAmountAndTxData(
        receiverAddress?: string,
        fromAddress?: string
    ): Promise<SuiEncodedConfigAndToAmount>;
}
