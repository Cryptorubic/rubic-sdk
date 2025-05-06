import { RubicSdkError } from 'src/common/errors';

/**
 * Thrown, when method is not whitelisted on proxy contract.
 */
export class UnapprovedMethodError extends RubicSdkError {
    constructor(public readonly method: string) {
        super();
        Object.setPrototypeOf(this, UnapprovedMethodError.prototype);
    }
}
