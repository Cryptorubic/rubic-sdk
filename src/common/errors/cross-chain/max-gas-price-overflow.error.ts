import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class MaxGasPriceOverflowError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, MaxGasPriceOverflowError.prototype);
    }
}
