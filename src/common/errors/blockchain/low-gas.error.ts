import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class LowGasError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, LowGasError.prototype);
    }
}
