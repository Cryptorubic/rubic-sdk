import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class InsufficientFundsError extends RubicSdkError {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, InsufficientFundsError.prototype);
    }
}
