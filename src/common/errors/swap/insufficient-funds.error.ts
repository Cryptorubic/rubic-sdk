import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when user doesn't have enough balance.
 */
export class InsufficientFundsError extends RubicSdkError {
    /**
     * @param symbol Token symbol.
     */
    constructor(public readonly symbol: string) {
        super();
        Object.setPrototypeOf(this, InsufficientFundsError.prototype);
    }
}
