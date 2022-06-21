import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, when user doesn't have enough native token balance for gas fee plus `value`.
 */
export class InsufficientFundsGasPriceValueError extends RubicSdkError {}
