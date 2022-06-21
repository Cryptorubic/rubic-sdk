import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/core';

export class CrossChainMinAmountError extends RubicSdkError {
    constructor(private readonly minAmount: BigNumber, private readonly token: PriceTokenAmount) {
        super(`Min amount is ${minAmount.toFixed()} ${token.symbol}`);
        Object.setPrototypeOf(this, CrossChainMinAmountError.prototype);
    }
}
