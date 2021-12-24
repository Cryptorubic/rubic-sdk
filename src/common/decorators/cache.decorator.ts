import { RubicSdkError } from '@common/errors/rubic-sdk.error';

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

    const storage = new WeakMap<Function, Map<string, unknown>>();

    descriptor.value = function method(this: Function, ...args: unknown[]): unknown {
        if (!storage.has(this)) {
            storage.set(this, new Map<string, unknown>());
        }

        const instanceStore = storage.get(this)!;
        const key = generateKey(args);
        if (instanceStore.has(key)) {
            return instanceStore.get(key);
        }

        const result = (originalMethod as unknown as Function).apply(this, args);
        instanceStore.set(key, result);
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

    const storage = new WeakMap<Function, Map<string, unknown>>();

    descriptor.value = async function method(this: Function, ...args: unknown[]): Promise<unknown> {
        if (!storage.has(this)) {
            storage.set(this, new Map<string, unknown>());
        }

        const key = generateKey(args);
        const instanceStore = storage.get(this)!;
        if (instanceStore.has(key)) {
            return instanceStore.get(key);
        }

        const result = await (originalMethod as unknown as Function).apply(this, args);
        instanceStore.set(key, result);
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

    const storage = new WeakMap<Function, Map<string, unknown>>();

    descriptor.value = async function method(this: Function, ...args: unknown[]): Promise<unknown> {
        if (!storage.has(this)) {
            storage.set(this, new Map<string, unknown>());
        }

        const instanceStore = storage.get(this)!;
        const key = generateKey(args);
        if (instanceStore.has(key)) {
            return instanceStore.get(key);
        }

        const result = await (originalMethod as unknown as Function).apply(this, args);
        if (result.notSave) {
            instanceStore.delete(key);
        } else {
            instanceStore.set(key, result.value);
        }
        return result.value;
    } as unknown as T;
}

export type ConditionalResult<T> = {
    notSave: boolean;
    value: T;
};
