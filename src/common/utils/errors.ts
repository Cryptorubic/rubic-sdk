import { RubicSdkError } from 'src/common/errors';

export function parseError(err: unknown, defaultMessage?: string): RubicSdkError {
    if (err instanceof RubicSdkError) {
        return err;
    }
    return new RubicSdkError((err as Error)?.message || defaultMessage || 'Unknown error');
}
