import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown during swap, if user's selected network does not match source blockchain
 * in swap parameters.
 */
export class WrongNetworkError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongNetworkError.prototype);
    }
}
