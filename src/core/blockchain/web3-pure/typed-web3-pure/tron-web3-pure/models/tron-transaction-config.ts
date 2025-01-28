import { TronParameters } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-parameters';

export interface TronTransactionConfig {
    signature: string;
    arguments: TronParameters;
    to: string;

    feeLimit?: number;
    callValue?: number;

    rawParameter?: string;
}
