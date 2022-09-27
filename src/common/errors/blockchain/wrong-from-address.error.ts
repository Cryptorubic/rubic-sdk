import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when passed wrong from address in `encode` function.
 */
export class WrongFromAddressError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongFromAddressError.prototype);
    }
}
