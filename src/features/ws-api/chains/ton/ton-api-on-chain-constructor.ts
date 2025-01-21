import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    TonBlockchainName
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { TonOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/ton-on-chain-trade/models/ton-on-chian-trade-types';

export interface TonApiOnChainConstructor {
    from: PriceTokenAmount<TonBlockchainName>;
    to: PriceTokenAmount<TonBlockchainName>;
    feeInfo: FeeInfo;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
    tradeStruct: TonOnChainTradeStruct;
}
