import {
    QuoteRequestInterface,
    QuoteResponseInterface,
    SolanaBlockchainName
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

export interface SolanaApiCrossChainConstructor {
    from: PriceTokenAmount<SolanaBlockchainName>;
    to: PriceTokenAmount;
    feeInfo: FeeInfo;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}
