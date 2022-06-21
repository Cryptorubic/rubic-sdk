import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * @internal
 * Thrown, when provider does not support provided blockchain.
 */
export class NotSupportedBlockchain extends RubicSdkError {}
