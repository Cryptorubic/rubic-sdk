import { RubicSdkError } from 'src/common/errors';
import { SdkSwapErrorOnProviderSide } from 'src/common/errors/swap/swap-error-on-provider-side';
import {
    XY_ERROR_CODE,
    XyErrorCode
} from 'src/features/common/providers/xy/constants/xy-error-code';

export function xyAnalyzeStatusCode(errorCode: XyErrorCode, errorMessage: string): void {
    if (XY_ERROR_CODE[errorCode] && errorMessage !== '') {
        throw new RubicSdkError(errorMessage);
    }

    throw new SdkSwapErrorOnProviderSide();
}
