import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * Thrown, when tokens' pair doesn't have enough liquidity.
 */
export class InsufficientLiquidityError extends RubicSdkError {}
