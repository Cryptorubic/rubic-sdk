import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when approve method is called, but there is enough allowance.
 */
export class UnnecessaryApproveError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, UnnecessaryApproveError.prototype);
    }
}
