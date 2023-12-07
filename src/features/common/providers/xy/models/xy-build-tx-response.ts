import { XyQuoteErrorResponse } from 'src/features/common/providers/xy/models/xy-quote-error-response';
import { XyRoute } from 'src/features/common/providers/xy/models/xy-quote-success-response';

export interface XyBuildTxResponse extends XyQuoteErrorResponse {
    success: boolean;
    route: XyRoute;
    tx: {
        to: string;
        data: string;
        value: string;
    };
}
