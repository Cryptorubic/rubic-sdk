import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when provider does not support provided tokens.
 */
export class NotSupportedTokensError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, NotSupportedTokensError.prototype);
    }
}
