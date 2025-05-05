import { RubicSdkError } from 'src/common/errors';

/**
 * Thrown, when contract is not whitelisted on proxy contract.
 */
export class UnapprovedContractError extends RubicSdkError {
    constructor(public readonly contract: string) {
        super();
        Object.setPrototypeOf(this, UnapprovedContractError.prototype);
    }
}
