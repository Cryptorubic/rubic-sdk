import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class FailedToCheckForTransactionReceiptError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, FailedToCheckForTransactionReceiptError.prototype);
    }
}
