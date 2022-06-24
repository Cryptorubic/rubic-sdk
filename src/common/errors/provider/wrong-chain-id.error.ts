import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, when provided chain id does not match real one, set in wallet.
 */
export class WrongChainIdError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongChainIdError.prototype);
    }
}
