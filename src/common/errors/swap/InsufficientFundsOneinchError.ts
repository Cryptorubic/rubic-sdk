import { RubicSdkError } from '@common/errors/rubic-sdk-error';

class InsufficientFundsOneinchError extends RubicSdkError {
    constructor() {
        super();
    }
}

export default InsufficientFundsOneinchError;
