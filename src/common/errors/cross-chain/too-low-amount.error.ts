import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, when amount of tokens don't cover provider's fee
 */
export class TooLowAmountError extends RubicSdkError {
    constructor() {
        super(
            "The swap can't be executed with the entered amount of tokens. Please change it to the greater amount."
        );
        Object.setPrototypeOf(this, TooLowAmountError.prototype);
    }
}
