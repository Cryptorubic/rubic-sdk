import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';

export class MinAmountError extends RubicSdkError {
    constructor(public readonly minAmount: BigNumber, public readonly tokenSymbol: string) {
        super(`Min amount is ${new BigNumber(minAmount).toFixed()} ${tokenSymbol}`);
        Object.setPrototypeOf(this, MinAmountError.prototype);
    }
}
