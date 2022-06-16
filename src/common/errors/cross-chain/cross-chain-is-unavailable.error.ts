import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class CrossChainIsUnavailableError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, CrossChainIsUnavailableError.prototype);
    }
}
