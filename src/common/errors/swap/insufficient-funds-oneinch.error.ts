import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { BlockchainName } from 'src/core';

/**
 * Thrown by 1inch, if user doesn't have enough balance.
 */
export class InsufficientFundsOneinchError extends RubicSdkError {
    constructor(public readonly blockchain: BlockchainName) {
        super();
        Object.setPrototypeOf(this, InsufficientFundsOneinchError.prototype);
    }
}
