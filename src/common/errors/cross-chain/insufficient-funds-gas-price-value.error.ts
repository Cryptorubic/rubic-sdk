import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class InsufficientFundsGasPriceValueError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, InsufficientFundsGasPriceValueError.prototype);
    }
}
