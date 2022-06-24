import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

/**
 * Thrown, when toSlippage tolerance is too low to calculate Celer trade.
 */
export class LowToSlippageError extends RubicSdkError {}
