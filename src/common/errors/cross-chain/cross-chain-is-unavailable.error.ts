import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, when cross-chain contracts are on pause or there is not enough crypto balance.
 */
export class CrossChainIsUnavailableError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, CrossChainIsUnavailableError.prototype);
    }
}
