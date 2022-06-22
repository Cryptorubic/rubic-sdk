import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class InsufficientFundsError extends RubicSdkError {
    constructor(
        public readonly tokenSymbol: string,
        public readonly balance: string,
        public readonly requiredBalance: string
    ) {
        super();
        Object.setPrototypeOf(this, InsufficientFundsError.prototype);
    }
}
