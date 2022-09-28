import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when method, which requires connected wallet, is called without
 * wallet being connected.
 */
export class WalletNotConnectedError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WalletNotConnectedError.prototype);
    }
}
