import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, when gas price is too low.
 */
export class LowGasError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, LowGasError.prototype);
    }
}
