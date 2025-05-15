import { RubicSdkError } from '../rubic-sdk.error';

export class TradeExpiredError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, TradeExpiredError.prototype);
    }
}
