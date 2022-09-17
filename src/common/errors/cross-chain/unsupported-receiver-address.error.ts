import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

export class UnsupportedReceiverAddressError extends RubicSdkError {
    constructor() {
        super('This provider doesn’t support the receiver address');
        Object.setPrototypeOf(this, UnsupportedReceiverAddressError.prototype);
    }
}
