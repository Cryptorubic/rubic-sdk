import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';

export class CrossChainMaxAmountError extends RubicSdkError {
    constructor(maxAmount: BigNumber, tokenSymbol: string) {
        super(`Max amount is ${maxAmount.toFixed()} ${tokenSymbol}`);
        Object.setPrototypeOf(this, CrossChainMaxAmountError.prototype);
    }
}
