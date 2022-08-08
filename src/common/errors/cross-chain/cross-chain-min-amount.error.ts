import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import BigNumber from 'bignumber.js';

export class CrossChainMinAmountError extends RubicSdkError {
    constructor(public readonly minAmount: BigNumber, public readonly tokenSymbol: string) {
        super(`Min amount is ${minAmount.toFixed()} ${tokenSymbol}`);
        Object.setPrototypeOf(this, CrossChainMinAmountError.prototype);
    }
}
