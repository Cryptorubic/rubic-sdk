import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeStruct } from '../../evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface TonEncodedConfigAndToAmount<T> {
    tx: T;
    toAmount: string;
}

export interface TonOnChainTradeStruct extends OnChainTradeStruct<TonBlockchainName> {}
