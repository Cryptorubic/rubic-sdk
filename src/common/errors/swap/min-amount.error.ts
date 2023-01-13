import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors/rubic-sdk.error';

export class MinAmountError extends RubicSdkError {
    constructor(public readonly minAmount: BigNumber, public readonly tokenSymbol: string) {
        super(`Min amount is ${new BigNumber(minAmount).toFixed()} ${tokenSymbol}`);
        Object.setPrototypeOf(this, MinAmountError.prototype);
    }
}
