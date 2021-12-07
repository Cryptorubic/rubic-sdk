export function Pure<T>(
    _target: Object,
    propertyKey: string,
    { get, enumerable }: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
    if (!get) {
        throw new Error('pure can only be used with getters');
    }

    return {
        enumerable,
        get(): T {
            const value = get.call(this);

            Object.defineProperty(this, propertyKey, { enumerable, value });

            return value;
        }
    };
}
