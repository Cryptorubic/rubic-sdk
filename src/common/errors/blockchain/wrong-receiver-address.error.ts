import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when passed wrong receiver address.
 */
export class WrongReceiverAddressError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongReceiverAddressError.prototype);
    }
}
