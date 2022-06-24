import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, when user cancels transaction.
 */
export class UserRejectError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, UserRejectError.prototype);
    }
}
