import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

export class MaxAmountError extends RubicSdkError {
    constructor(public readonly maxAmount: BigNumber, public readonly tokenSymbol: string) {
        super(`Max amount is ${new BigNumber(maxAmount).toFixed()} ${tokenSymbol}`);
        Object.setPrototypeOf(this, MaxAmountError.prototype);
    }
}
