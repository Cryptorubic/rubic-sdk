import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when provider does not support region.
 */
export class NotSupportedRegionError extends RubicSdkError {
    constructor() {
        super('Bridgers does not provide services for your current country/region.');
        Object.setPrototypeOf(this, NotSupportedRegionError.prototype);
    }
}
