import { RubicSdkError } from 'src/common/errors';
import {
    XY_ERROR_CODE,
    XyErrorCode
} from 'src/features/common/providers/xy/constants/xy-error-code';

export function xyAnalyzeStatusCode(errorCode: XyErrorCode, errorMessage: string): void {
    if (XY_ERROR_CODE[errorCode]) {
        throw new RubicSdkError(errorMessage);
    }

    throw new RubicSdkError('Unknown Error.');
}
