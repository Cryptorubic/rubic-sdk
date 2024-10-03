import { TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { OnChainTradeStruct } from '../../evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface TonEncodedConfigAndToAmount<T> {
    tx: T;
    toAmount: string;
}

export type TonOnChainTradeStruct = Omit<
    OnChainTradeStruct<TonBlockchainName>,
    'fromWithoutFee' | 'proxyFeeInfo' | 'path'
> & { routingPath: RubicStep[] };
