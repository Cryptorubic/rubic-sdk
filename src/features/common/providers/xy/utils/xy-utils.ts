import { RubicSdkError } from 'src/common/errors';
import { XyQuoteErrorCode } from 'src/features/common/providers/xy/models/xy-quote-error-response';

export function xyAnalyzeStatusCode(code: XyQuoteErrorCode, message: string): void {
    switch (code) {
        case '10000':
        case '10001':
        case '20001':
        case '20003':
        case '20004':
        case '20005':
        case '20006':
        case '20007':
        case '20008':
        case '30001':
        case '30002':
        case '30003':
        case '30004':
        case '30005':
        case '30006':
            throw new RubicSdkError(message);
        default:
            throw new RubicSdkError('Unknown Error.');
    }
}
