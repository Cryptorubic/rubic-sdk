import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

export class UnsupportedTokenPairError extends RubicSdkError {
    constructor() {
        super('The swap between this pair of tokens is unavailable.');
        Object.setPrototypeOf(this, UnsupportedTokenPairError.prototype);
    }
}
