import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * @internal
 * Thrown, when transaction is passed, but web3 cannot retrieve transaction receipt.
 */
export class FailedToCheckForTransactionReceiptError extends RubicSdkError {}
