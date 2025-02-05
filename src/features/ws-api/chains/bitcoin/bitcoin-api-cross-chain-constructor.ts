import {
    BitcoinBlockchainName,
    QuoteRequestInterface,
    QuoteResponseInterface
} from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

export interface BitcoinApiCrossChainConstructor {
    from: PriceTokenAmount<BitcoinBlockchainName>;
    to: PriceTokenAmount;
    feeInfo: FeeInfo;
    apiQuote: QuoteRequestInterface;
    apiResponse: QuoteResponseInterface;
    routePath: RubicStep[];
}
