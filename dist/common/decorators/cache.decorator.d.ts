export declare function Cache<T>(_: Object, __: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;
export declare function PCache<T>(_: Object, __: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;
/**
 * Decorated function should returns {@link ConditionalResult}.
 * You have to check types by yourself {@see https://github.com/microsoft/TypeScript/issues/4881}
 */
export declare function PConditionalCache<T>(_: Object, __: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;
export declare type ConditionalResult<T> = {
    notSave: boolean;
    value: T;
};
