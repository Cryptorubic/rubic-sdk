import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class TransactionRevertedError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, TransactionRevertedError.prototype);
    }
}
