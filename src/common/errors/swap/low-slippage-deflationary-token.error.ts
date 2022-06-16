import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class LowSlippageDeflationaryTokenError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, LowSlippageDeflationaryTokenError.prototype);
    }
}
