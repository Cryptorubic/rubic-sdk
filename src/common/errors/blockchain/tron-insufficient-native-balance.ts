import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, if transaction was reverted because of insufficient native balance.
 */
export class TronInsufficientNativeBalance extends RubicSdkError {
    constructor() {
        super(
            'Insufficient funds of native token. Decrease swap amount or increase native tokens balance.'
        );
        Object.setPrototypeOf(this, TronInsufficientNativeBalance.prototype);
    }
}
