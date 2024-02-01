import BigNumber from 'bignumber.js';
import { TokenUtils } from 'src/common/utils/token-utils';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { SolanaOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/solana-on-chain-trade/solana-on-chain-trade';

import { GetToAmountAndTxDataResponse } from './models/aggregator-on-chain-types';

export abstract class AggregatorSolanaOnChainTrade extends SolanaOnChainTrade {
    protected async getTxConfigAndCheckAmount(
        receiverAddress?: string,
        fromAddress?: string,
        directTransaction?: EvmEncodeConfig
    ): Promise<EvmEncodeConfig> {
        if (directTransaction) {
            return directTransaction;
        }

        const { tx, toAmount } = await this.getToAmountAndTxData(receiverAddress, fromAddress);

        const evmEncodeConfig = {
            data: tx.data,
            to: '',
            value: ''
        };

        const newToTokenAmountMin = TokenUtils.getMinWeiAmountString(
            new BigNumber(toAmount),
            this.slippageTolerance
        );

        this.checkAmountChange(
            evmEncodeConfig,
            newToTokenAmountMin,
            this.toTokenAmountMin.stringWeiAmount
        );

        return evmEncodeConfig;
    }

    /**
     * @description Returns data for method OnChainTrade.checkAmountChange and EvmEncodeConfig value
     */
    protected abstract getToAmountAndTxData(
        receiverAddress?: string,
        fromAddress?: string
    ): Promise<GetToAmountAndTxDataResponse>;
}
