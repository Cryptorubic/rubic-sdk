import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, if token has deflation.
 */
export class DeflationTokenError extends RubicSdkError {
    constructor(public readonly symbol: string, public readonly deflationPercent: string) {
        super(`${symbol} token has ${deflationPercent}% deflation`);
        Object.setPrototypeOf(this, DeflationTokenError.prototype);
    }
}
