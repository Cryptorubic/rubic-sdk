import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, if transaction was reverted without specified error.
 */
export class TransactionRevertedError extends RubicSdkError {}
