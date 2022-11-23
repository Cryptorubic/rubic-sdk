import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when on-chain contracts are on pause.
 */
export class OnChainIsUnavailableError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, OnChainIsUnavailableError.prototype);
    }
}
