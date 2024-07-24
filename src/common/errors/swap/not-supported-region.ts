import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when provider does not support region.
 */
export class NotSupportedRegionError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, NotSupportedRegionError.prototype);
    }
}
