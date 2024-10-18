import { RubicSdkError } from '../rubic-sdk.error';

export class MaxDecimalsError extends RubicSdkError {
    constructor(public readonly decimals: number) {
        super(`Amount must have no more than ${decimals} digits after the decimal point`);
        Object.setPrototypeOf(this, MaxDecimalsError.prototype);
    }
}
