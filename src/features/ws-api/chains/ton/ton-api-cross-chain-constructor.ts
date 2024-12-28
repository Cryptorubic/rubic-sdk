import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    TonBlockchainName
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

export interface TonApiCrossChainConstructor {
    from: PriceTokenAmount<TonBlockchainName>;
    to: PriceTokenAmount;
    feeInfo: FeeInfo;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}
