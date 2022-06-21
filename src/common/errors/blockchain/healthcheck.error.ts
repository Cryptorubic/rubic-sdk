import { RubicSdkError } from '@common/errors/rubic-sdk.error';

/**
 * @internal
 * Thrown, if rpc provider has not passed healthcheck.
 */
export class HealthcheckError extends RubicSdkError {}
