import { TronTransactionConfig } from '@cryptorubic/web3';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';

export interface EvmEncodedConfigAndToAmount {
    tx: EvmEncodeConfig;
    toAmount: string;
}

export interface TronEncodedConfigAndToAmount {
    tx: TronTransactionConfig;
    toAmount: string;
}
