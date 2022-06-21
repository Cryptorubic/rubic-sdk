import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, when token cannot be swapped with provided options.
 */
export class LowSlippageError extends RubicSdkError {}
