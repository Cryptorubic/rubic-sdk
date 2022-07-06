import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * @internal
 * Thrown, if rpc provider has not passed healthcheck.
 */
export class HealthcheckError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, HealthcheckError.prototype);
    }
}
