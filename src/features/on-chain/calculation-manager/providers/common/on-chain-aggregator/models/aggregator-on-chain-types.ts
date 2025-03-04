import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { SuiEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/sui-web3-pure/sui-encode-config';

export interface EvmEncodedConfigAndToAmount {
    tx: EvmEncodeConfig;
    toAmount: string;
}

export interface SuiEncodedConfigAndToAmount {
    tx: SuiEncodeConfig;
    toAmount: string;
}
