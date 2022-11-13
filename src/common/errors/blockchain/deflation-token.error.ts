import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import { Token } from 'src/common/tokens';

/**
 * Thrown, if token has deflation.
 */
export class DeflationTokenError extends RubicSdkError {
    constructor(public readonly token: Token, public readonly deflationPercent: string) {
        super(`Token ${token.address} has ${deflationPercent}% deflation`);
        Object.setPrototypeOf(this, DeflationTokenError.prototype);
    }
}
