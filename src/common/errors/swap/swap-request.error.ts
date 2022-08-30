import { RubicSdkError } from 'src/common';

/**
 * Thrown, when `swap` request to API is failed.
 */
export class SwapRequestError extends RubicSdkError {
    constructor() {
        super(
            "Unfortunately, the provider couldn't generate the transaction. Please try again later."
        );
        Object.setPrototypeOf(this, SwapRequestError.prototype);
    }
}
