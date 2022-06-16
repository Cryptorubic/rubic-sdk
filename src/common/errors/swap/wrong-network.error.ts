import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class WrongNetworkError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, WrongNetworkError.prototype);
    }
}
