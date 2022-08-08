import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';

export class CrossChainMaxAmountError extends RubicSdkError {
    constructor(public readonly maxAmount: BigNumber, public readonly tokenSymbol: string) {
        super(`Max amount is ${maxAmount.toFixed()} ${tokenSymbol}`);
        Object.setPrototypeOf(this, CrossChainMaxAmountError.prototype);
    }
}
