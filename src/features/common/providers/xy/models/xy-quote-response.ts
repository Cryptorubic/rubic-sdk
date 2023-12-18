import { XyQuoteErrorResponse } from 'src/features/common/providers/xy/models/xy-quote-error-response';
import { XyQuoteSuccessResponse } from 'src/features/common/providers/xy/models/xy-quote-success-response';

export interface XyQuoteResponse extends XyQuoteSuccessResponse, XyQuoteErrorResponse {}
