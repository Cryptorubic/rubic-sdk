import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class LowSlippageError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, LowSlippageError.prototype);
    }
}
