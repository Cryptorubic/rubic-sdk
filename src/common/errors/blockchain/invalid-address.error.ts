import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when passed wallet address is invalid for {@link chainType}.
 */
export class InvalidAddressError extends RubicSdkError {
    constructor(public readonly address: string) {
        super();
        Object.setPrototypeOf(this, InvalidAddressError.prototype);
    }
}
