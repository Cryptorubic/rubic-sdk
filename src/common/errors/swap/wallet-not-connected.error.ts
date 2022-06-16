import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class WalletNotConnectedError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WalletNotConnectedError.prototype);
    }
}
