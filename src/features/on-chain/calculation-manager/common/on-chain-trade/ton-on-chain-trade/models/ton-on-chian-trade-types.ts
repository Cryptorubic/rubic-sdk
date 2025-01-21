import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
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
> & {
    routingPath: RubicStep[];
    isChangedSlippage: boolean;
    apiQuote: QuoteRequestInterface | null;
    apiResponse: QuoteResponseInterface | null;
};

export interface TonTradeAdditionalInfo {
    isMultistep: boolean;

    /**
     * used when you manually change slippage in provider in specefic conditions
     */
    isChangedSlippage: boolean;
}
