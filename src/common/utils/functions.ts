/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tuple } from 'ts-essentials';

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

export async function tryExecuteAsync<T extends Tuple, R>(
    func: (...args: T) => Promise<R>,
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
