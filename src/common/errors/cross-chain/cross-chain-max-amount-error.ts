import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/core';

export class CrossChainMaxAmountError extends RubicSdkError {
    constructor(private readonly maxAmount: BigNumber, private readonly token: PriceTokenAmount) {
        super(`Max amount is ${maxAmount.toFixed()} ${token.symbol}`);
        Object.setPrototypeOf(this, CrossChainMaxAmountError.prototype);
    }
}
