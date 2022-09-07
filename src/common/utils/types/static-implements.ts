/**
 * Decorator for classes, which allows to implement static methods through interface.
 */
export function staticImplements<T>() {
    return <U extends T>(constructor: U) => constructor;
}
