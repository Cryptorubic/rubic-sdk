import { RubicError } from '@common/errors/rubic-error';

type Func<A, R> = (...args: A[]) => R;

function generateKey(...args: unknown[]): string {
    return args.reduce(
        (acc, arg) => (Object(arg) === arg ? acc + JSON.stringify(arg) : acc + String(arg)),
        ''
    ) as string;
}

export function Cache<A, R>(
    _: Object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<Func<A, R>>
): TypedPropertyDescriptor<Func<A, R>> | void {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
        throw new RubicError('Descriptor value is undefined.');
    }

    const storage = new Map<string, R>();

    descriptor.value = function method(...args: A[]): R {
        const key = generateKey(args);
        if (storage.has(key)) {
            return storage.get(key) as R;
        }

        const result = originalMethod.apply<ThisType<unknown>, A[], R>(this, args);
        storage.set(key, result);
        return result;
    };
}

export function PCache<T>(
    _: Object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
        throw new RubicError('Descriptor value is undefined.');
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
