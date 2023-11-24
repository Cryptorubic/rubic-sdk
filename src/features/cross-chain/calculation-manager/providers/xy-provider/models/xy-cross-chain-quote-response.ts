import { XyQuoteErrorResponse } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-quote-error-response';
import { XyQuoteSuccessResponse } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-quote-success-response';

export interface XyCrossChainQuoteResponse extends XyQuoteSuccessResponse, XyQuoteErrorResponse {}
