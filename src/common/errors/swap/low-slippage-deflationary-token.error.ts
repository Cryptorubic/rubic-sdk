import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, when user is selling deflationary token with too low slippage.
 */
export class LowSlippageDeflationaryTokenError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, LowSlippageDeflationaryTokenError.prototype);
    }
}
