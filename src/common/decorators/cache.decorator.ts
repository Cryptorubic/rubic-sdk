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
