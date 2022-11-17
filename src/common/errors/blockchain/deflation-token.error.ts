import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import { Token } from 'src/common/tokens';
import BigNumber from 'bignumber.js';

/**
 * Thrown, if token has deflation.
 */
export class DeflationTokenError extends RubicSdkError {
    constructor(public readonly token: Token, public readonly deflationPercent: BigNumber) {
        super(`Token ${token.address} has ${deflationPercent.dp(2).toFixed()}% deflation`);
        Object.setPrototypeOf(this, DeflationTokenError.prototype);
    }
}
