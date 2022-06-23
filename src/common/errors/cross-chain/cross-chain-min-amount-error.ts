import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/core';

export class CrossChainMinAmountError extends RubicSdkError {
    constructor(public readonly minAmount: BigNumber, public readonly token: PriceTokenAmount) {
        super(`Min amount is ${minAmount.toFixed()} ${token.symbol}`);
        Object.setPrototypeOf(this, CrossChainMinAmountError.prototype);
    }
}
