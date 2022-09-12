import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

/**
 * Thrown, via provider is not whitelisted in .
 */
export class NotWhitelistedProviderError extends RubicSdkError {
    constructor(public readonly providerRouter: string, public readonly providerGateway?: string) {
        super();
        Object.setPrototypeOf(this, NotWhitelistedProviderError.prototype);
    }
}
