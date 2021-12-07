type AbstractConstructorHelper<T> = (new (...args: unknown[]) => { [x: string]: unknown }) & T;
export type AbstractConstructorParameters<T> = ConstructorParameters<AbstractConstructorHelper<T>>;
