import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export class InsufficientLiquidityError extends RubicSdkError {
    constructor() {
        super();
        Object.setPrototypeOf(this, InsufficientLiquidityError.prototype);
    }
}
