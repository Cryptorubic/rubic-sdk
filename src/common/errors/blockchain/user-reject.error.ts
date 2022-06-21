import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, when user cancels transaction.
 */
export class UserRejectError extends RubicSdkError {}
