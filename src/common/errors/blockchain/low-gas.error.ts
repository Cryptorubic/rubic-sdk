import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, when gas price is too low.
 */
export class LowGasError extends RubicSdkError {}
