import { CacheConfig } from '@rsdk-common/decorators/models/cache-config';
import { ConditionalResult } from '@rsdk-common/decorators/models/conditional-result';
import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

type DecoratorSignature = <T>(
    _: Object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

type CacheItem<T> = {
    validUntilTimestamp: number;
    value: T | Promise<T>;
};

function generateKey(...args: unknown[]): string {
    return args.reduce(
        (acc, arg) => (Object(arg) === arg ? acc + JSON.stringify(arg) : acc + String(arg)),
        ''
    ) as string;
}

function saveResult<T>(
    storage: Map<string, CacheItem<T>>,
    key: string,
    result: T,
    maxAge?: number
): void {
    const validUntilTimestamp = maxAge ? Date.now() + maxAge : Infinity;
    storage.set(key, { validUntilTimestamp, value: result });
}

function buildGetterCacheDescriptor<T>(
    propertyKey: string | symbol,
    { get, enumerable }: { get: () => T; enumerable?: boolean }
): TypedPropertyDescriptor<T> {
    return {
        enumerable,
        get(): T {
            const value = get.call(this);

            Object.defineProperty(this, propertyKey, {
                enumerable,
                value
            });

            return value;
        }
    };
}

function modifyMethodCacheDescriptor<T>(
    cacheConfig: CacheConfig,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    const storage = new WeakMap<Function, Map<string, CacheItem<T>>>();

    descriptor.value = function method(this: Function, ...args: unknown[]): unknown {
        if (!storage.has(this)) {
            storage.set(this, new Map<string, CacheItem<T>>());
        }

        const instanceStore = storage.get(this)!;
        const key = generateKey(args);
        if (instanceStore.has(key)) {
            const cacheItem = instanceStore.get(key)!;
            if (cacheItem.validUntilTimestamp > Date.now()) {
                return cacheItem.value;
            }
            instanceStore.delete(key);
        }

        let result: T | ConditionalResult<T> = (originalMethod as unknown as Function).apply(
            this,
            args
        );

        if (cacheConfig.conditionalCache) {
            if (result instanceof Promise) {
                const handledPromise = result.then((resolved: ConditionalResult<T>) => {
                    if (resolved.notSave) {
                        instanceStore.delete(key);
                    }
                    return resolved.value;
                }) as unknown as T;
                saveResult(instanceStore, key, handledPromise, cacheConfig.maxAge);
                return handledPromise;
            }

            result = result as ConditionalResult<T>;
            if (result.notSave) {
                instanceStore.delete(key);
            } else {
                saveResult(instanceStore, key, result.value, cacheConfig.maxAge);
            }
            return result.value;
        }

        saveResult(instanceStore, key, result as T, cacheConfig.maxAge);
        return result;
    } as unknown as T;

    return descriptor;
}

function CacheBuilder(cacheConfig: CacheConfig): DecoratorSignature {
    return function cacheBuilder<T>(
        _: Object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>
    ): TypedPropertyDescriptor<T> | void {
        const { get, value: originalMethod } = descriptor;
        if (get) {
            return buildGetterCacheDescriptor(propertyKey, {
                get,
                enumerable: descriptor.enumerable
            });
        }

        if (!originalMethod) {
            throw new RubicSdkError('Descriptor value is undefined.');
        }

        return modifyMethodCacheDescriptor(cacheConfig, descriptor);
    };
}

export function Cache(cacheConfigOrTarget: CacheConfig): DecoratorSignature;
export function Cache<T>(
    cacheConfigOrTarget: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void;
export function Cache<T>(
    cacheConfigOrTarget: Object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<T>
): DecoratorSignature | TypedPropertyDescriptor<T> | void {
    const defaultCacheConfig = {};

    // if decorator called with config as @Cache({ ... })
    if (!propertyKey) {
        return CacheBuilder(cacheConfigOrTarget);
    }

    // decorator called as @Cache

    if (!descriptor) {
        throw new RubicSdkError('Descriptor is undefined.');
    }
    return CacheBuilder(defaultCacheConfig)<T>(cacheConfigOrTarget, propertyKey, descriptor);
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
