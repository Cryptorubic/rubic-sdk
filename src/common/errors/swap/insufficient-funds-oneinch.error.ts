import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown by 1inch, if user doesn't have enough balance.
 */
export class InsufficientFundsOneinchError extends RubicSdkError {}
