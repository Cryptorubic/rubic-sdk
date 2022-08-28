import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, when rpc is failed due to timeout or rate limit.
 */
export class RpcFailedError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, RpcFailedError.prototype);
    }
}
