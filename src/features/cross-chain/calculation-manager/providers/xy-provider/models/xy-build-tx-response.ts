import { XyQuoteErrorResponse } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-quote-error-response';
import { XyRoute } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-quote-success-response';

export interface XyBuildTxResponse extends XyQuoteErrorResponse {
    success: boolean;
    route: XyRoute;
    tx: {
        to: string;
        data: string;
        value: string; // '0x2386f26fc10000'
    };
}
