import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class HealthcheckError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, HealthcheckError.prototype);
    }
}
