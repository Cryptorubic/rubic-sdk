declare type AbstractConstructorHelper<T> = (new (...args: unknown[]) => {
    [x: string]: unknown;
}) & T;
export declare type AbstractConstructorParameters<T> = ConstructorParameters<AbstractConstructorHelper<T>>;
export {};
