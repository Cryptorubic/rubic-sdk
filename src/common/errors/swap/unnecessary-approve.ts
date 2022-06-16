import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class UnnecessaryApprove extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, UnnecessaryApprove.prototype);
    }
}
