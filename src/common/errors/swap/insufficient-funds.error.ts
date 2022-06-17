import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, when user doesn't have enough balance.
 */
export class InsufficientFundsError extends RubicSdkError {}
