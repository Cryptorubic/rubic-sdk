import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';
import { Token } from 'src/common/tokens';

/**
 * Thrown, when user doesn't have enough balance.
 */
export class InsufficientFundsError extends RubicSdkError {
    /**
     * @param token Token to swap.
     * @param balance Token's balance on user wallet in Eth units.
     * @param requiredBalance Required token's amount to swap in Eth units.
     */
    constructor(
        public readonly token: Token,
        public readonly balance: BigNumber,
        public readonly requiredBalance: BigNumber
    ) {
        super();
        Object.setPrototypeOf(this, InsufficientFundsError.prototype);
    }
}
