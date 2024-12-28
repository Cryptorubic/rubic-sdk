import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    TronBlockchainName
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

export interface TronApiOnChainConstructor {
    from: PriceTokenAmount<TronBlockchainName>;
    to: PriceTokenAmount<TronBlockchainName>;
    feeInfo: FeeInfo;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}
