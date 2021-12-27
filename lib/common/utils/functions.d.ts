import { Tuple } from 'ts-essentials';
declare type SuccessfulCall<T> = {
    success: true;
    value: T;
};
declare type ErrorCall = {
    success: false;
    error: unknown;
};
export declare function tryExecute(func: (...args: any[]) => unknown, parameters: Parameters<typeof func>[]): SuccessfulCall<ReturnType<typeof func>> | ErrorCall;
export declare function tryExecuteAsync<T extends Tuple, R>(func: (...args: T) => Promise<R>, parameters: Parameters<typeof func>): Promise<SuccessfulCall<R> | ErrorCall>;
export {};
