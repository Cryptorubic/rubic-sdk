import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * @internal
 * Thrown, when transaction is passed, but web3 cannot retrieve transaction receipt.
 */
export class FailedToCheckForTransactionReceiptError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, FailedToCheckForTransactionReceiptError.prototype);
    }
}
