import { RubicSdkError } from '@common/errors/rubic-sdk-error';

function generateKey(...args: unknown[]): string {
    return args.reduce(
        (acc, arg) => (Object(arg) === arg ? acc + JSON.stringify(arg) : acc + String(arg)),
        ''
    ) as string;
}

export function Cache<T>(
    _: Object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
        throw new RubicSdkError('Descriptor value is undefined.');
    }

    const storage = new Map<string, unknown>();

    descriptor.value = function method(this: Function, ...args: unknown[]): unknown {
        const key = generateKey(args);
        if (storage.has(key)) {
            return storage.get(key);
        }

        const result = (originalMethod as unknown as Function).apply(this, args);
        storage.set(key, result);
        return result;
    } as unknown as T;
}

export function PCache<T>(
    _: Object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
        throw new RubicSdkError('Descriptor value is undefined.');
    }

    const storage = new Map<string, unknown>();

    descriptor.value = async function method(this: Function, ...args: unknown[]): Promise<unknown> {
        const key = generateKey(args);
        if (storage.has(key)) {
            return storage.get(key);
        }

        const result = await (originalMethod as unknown as Function).apply(this, args);
        storage.set(key, result);
        return result;
    } as unknown as T;
}

/**
 * Decorated function should returns {@link ConditionalResult}.
 * You have to check types by yourself {@see https://github.com/microsoft/TypeScript/issues/4881}
 */
export function PConditionalCache<T>(
    _: Object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
        throw new RubicSdkError('Descriptor value is undefined.');
    }

    const storage = new Map<string, unknown>();

    descriptor.value = async function method(this: Function, ...args: unknown[]): Promise<unknown> {
        const key = generateKey(args);
        if (storage.has(key)) {
            return storage.get(key);
        }

        const result = await (originalMethod as unknown as Function).apply(this, args);
        if (result.notSave) {
            storage.delete(key);
        } else {
            storage.set(key, result.value);
        }
        return result.value;
    } as unknown as T;
}

export type ConditionalResult<T> = {
    notSave: boolean;
    value: T;
};
