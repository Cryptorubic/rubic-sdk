import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, when slippage tolerance is too low for selected token.
 */
export class LowSlippageError extends RubicSdkError {}
