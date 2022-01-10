import { CacheConfig } from './models/cache-config';
declare type DecoratorSignature = <T>(_: Object, __: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
export declare function Cache(cacheConfigOrTarget: CacheConfig): DecoratorSignature;
export declare function Cache<T>(cacheConfigOrTarget: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;
/**
 * Decorated function should returns {@link ConditionalResult}.
 * You have to check types by yourself {@see https://github.com/microsoft/TypeScript/issues/4881}
 */
export declare function PConditionalCache<T>(_: Object, __: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;
export {};
