import { RubicSdkError } from 'src/common/errors';

/**
 * Thrown, when contract is not whitelisted on proxy contract.
 */
export class UnlistedError extends RubicSdkError {
    constructor(public readonly contract: string, public readonly selector: string) {
        super();
        Object.setPrototypeOf(this, UnlistedError.prototype);
    }
}
