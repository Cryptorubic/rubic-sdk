import { RubicSdkError } from 'src/common/errors';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';

import { ON_CHAIN_TRADE_TYPE } from '../common/models/on-chain-trade-type';
import { EvmOnChainTrade } from '../common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class OdosOnChainTrade extends EvmOnChainTrade {
    public readonly type = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        console.log(options);
        return { data: '', to: '', value: '' };
    }
}
