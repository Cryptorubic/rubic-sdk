import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class WrongChainIdError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongChainIdError.prototype);
    }
}
