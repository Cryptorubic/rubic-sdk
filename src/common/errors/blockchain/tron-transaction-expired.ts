import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, if transaction signing in wallet expired.
 */
export class TronTransactionExpired extends RubicSdkError {
    constructor() {
        super('Signing timeout expired. Please, try again.');
        Object.setPrototypeOf(this, TronTransactionExpired.prototype);
    }
}
