import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';

export interface TonTransactionConfig {
    tonMessages: TonEncodedConfig[];
}
