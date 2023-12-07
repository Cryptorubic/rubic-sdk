import { XyErrorCode } from 'src/features/common/providers/xy/constants/xy-error-code';

export interface XyQuoteErrorResponse {
    success: boolean;
    errorCode: XyErrorCode;
    errorMsg: string;
}
