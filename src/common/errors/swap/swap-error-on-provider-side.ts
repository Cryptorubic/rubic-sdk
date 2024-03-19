import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when provider rejects swap by internal reason.
 */
export class SdkSwapErrorOnProviderSide extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, SdkSwapErrorOnProviderSide.prototype);
    }
}
