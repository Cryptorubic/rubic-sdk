import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when `quote` request in bridgers is failed.
 */
export class BridgersPairIsUnavailableError extends RubicSdkError {
    constructor() {
        super('The swap using this pair is currently unavailable. Please try again later.');
        Object.setPrototypeOf(this, BridgersPairIsUnavailableError.prototype);
    }
}
