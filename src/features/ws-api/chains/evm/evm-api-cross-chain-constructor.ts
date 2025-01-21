import {
    EvmBlockchainName,
    QuoteRequestInterface,
    QuoteResponseInterface
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

export interface EvmApiCrossChainConstructor {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount;
    feeInfo: FeeInfo;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
}
