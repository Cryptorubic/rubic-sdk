import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown during swap, if user's selected network does not match source blockchain
 * in swap parameters.
 */
export class WrongNetworkError extends RubicSdkError {}
