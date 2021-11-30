/* eslint-disable @typescript-eslint/no-explicit-any */
type SuccessfulCall<T> = {
    success: true;
    value: T;
};

type ErrorCall = {
    success: false;
    error: unknown;
};

export function tryExecute(
    func: (...args: any[]) => unknown,
    parameters: Parameters<typeof func>[]
): SuccessfulCall<ReturnType<typeof func>> | ErrorCall {
    try {
        const value = func(...parameters);
        return {
            success: true,
            value
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
}

export async function tryExecuteAsync<R>(
    func: (...args: any[]) => Promise<R>,
    parameters: Parameters<typeof func>
): Promise<SuccessfulCall<R> | ErrorCall> {
    try {
        const value = await func(...parameters);
        return {
            success: true,
            value
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
}
