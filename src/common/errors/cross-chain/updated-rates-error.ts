import { RubicSdkError } from 'src/common/errors';

/**
 * Thrown, when current gas price is higher, than max gas price on cross-chain contract
 * in target network.
 */
export class UpdatedRatesError extends RubicSdkError {
    constructor(
        public readonly transaction: {
            data: string;
            to: string;
            value: string;
            oldAmount: string;
            newAmount: string;
        }
    ) {
        super();
        Object.setPrototypeOf(this, UpdatedRatesError.prototype);
    }
}
