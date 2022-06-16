import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class InsufficientFundsOneinchError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, InsufficientFundsOneinchError.prototype);
    }
}
