import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, if transaction was reverted without specified error.
 */
export class TransactionRevertedError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, TransactionRevertedError.prototype);
    }
}
