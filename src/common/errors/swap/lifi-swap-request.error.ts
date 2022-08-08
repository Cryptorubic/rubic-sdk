import { RubicSdkError } from 'src/common';

/**
 * Thrown, when `swap` request to LiFi API is failed.
 */
export class LifiSwapRequestError extends RubicSdkError {
    constructor() {
        super(
            "Unfortunately, the provider couldn't generate the transaction. Please try again later."
        );
        Object.setPrototypeOf(this, LifiSwapRequestError.prototype);
    }
}
