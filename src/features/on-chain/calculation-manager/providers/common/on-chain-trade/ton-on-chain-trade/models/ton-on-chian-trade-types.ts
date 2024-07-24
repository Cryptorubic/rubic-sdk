import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';

import { OnChainTradeStruct } from '../../evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface TonEncodedConfigAndToAmount {
    tx: TonEncodedConfig;
    toAmount: string;
}

export interface TonOnChainTradeStruct extends OnChainTradeStruct<TonBlockchainName> {}
