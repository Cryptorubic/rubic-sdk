import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when slippage tolerance is too low for selected token.
 */
export class LowSlippageError extends RubicSdkError {
    constructor(public readonly minSlippage?: number) {
        super();
        Object.setPrototypeOf(this, LowSlippageError.prototype);
    }
}
