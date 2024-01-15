import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

import { EvmOnChainTrade } from '../on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export abstract class AggregatorOnChaiTrade extends EvmOnChainTrade {
    protected abstract getTransactionData(
        receiverAddress?: string,
        fromAddress?: string,
        directTransaction?: EvmEncodeConfig
    ): Promise<EvmEncodeConfig>;
}
