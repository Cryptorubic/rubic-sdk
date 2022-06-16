import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class UserRejectError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, UserRejectError.prototype);
    }
}
