import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when current gas price is higher, than max gas price on cross chain contract
 * in target network.
 */
export class MaxGasPriceOverflowError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, MaxGasPriceOverflowError.prototype);
    }
}
