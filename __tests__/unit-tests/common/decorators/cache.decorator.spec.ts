import JestMockPromise from 'jest-mock-promise';
import { Cache } from 'src/common';
import fn = jest.fn;

describe('Cache decorator tests', () => {
    test('Cache must be used when method is called second time.', () => {
        const spyFn = fn();
        const returnedValue = 1;
        class CacheTestClass {
            @Cache
            public zeroParametersCacheableMethod() {
                spyFn();
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallResult = testClassInstance.zeroParametersCacheableMethod();
        const secondCallResult = testClassInstance.zeroParametersCacheableMethod();

        expect(spyFn.mock.calls.length).toBe(1);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Cache must not be used when method is called second time with other parameter.', () => {
        const spyFn = fn();
        class CacheTestClass {
            @Cache
            public oneParametersCacheableMethod(parameter: unknown) {
                spyFn();
                return parameter;
            }
        }

        const testClassInstance = new CacheTestClass();
        testClassInstance.oneParametersCacheableMethod(0);
        testClassInstance.oneParametersCacheableMethod(1);

        expect(spyFn.mock.calls.length).toBe(2);
    });

    test('Cache must be used when method is called second time with same parameter. Stored value must be correct.', () => {
        const spyFn = fn();
        const additionSeed = 1;
        const firstCallParameter = 2;
        const secondCallParameter = 3;
        class CacheTestClass {
            @Cache
            public oneParametersCacheableMethod(parameter: number) {
                spyFn();
                return additionSeed + parameter;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallResult = testClassInstance.oneParametersCacheableMethod(firstCallParameter);
        const secondCallResult =
            testClassInstance.oneParametersCacheableMethod(secondCallParameter);
        const spyCallsAfterSecondTimeMethodCall = spyFn.mock.calls.length;
        const thirdCallResult = testClassInstance.oneParametersCacheableMethod(firstCallParameter);
        const spyCallsAfterThirdTimeMethodCall = spyFn.mock.calls.length;

        expect(spyCallsAfterSecondTimeMethodCall).toBe(2);
        expect(spyCallsAfterThirdTimeMethodCall).toBe(2);
        expect(firstCallResult).toBe(additionSeed + firstCallParameter);
        expect(secondCallResult).toBe(additionSeed + secondCallParameter);
        expect(thirdCallResult).toBe(firstCallResult);
    });

    test('Cache decorator must works with async functions.', async () => {
        const spyFn = fn();
        const promise = new JestMockPromise();

        const returnedValue = 1;
        class CacheTestClass {
            @Cache
            public async asyncCacheableMethod() {
                spyFn();
                await promise;
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallPromise = testClassInstance.asyncCacheableMethod();
        const secondCallPromise = testClassInstance.asyncCacheableMethod();
        promise.resolve();

        const firstCallResult = await firstCallPromise;
        const secondCallResult = await secondCallPromise;

        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
        expect(spyFn.mock.calls.length).toBe(1);
    });

    test('Cache decorator must works with async function which resolves before second call.', async () => {
        const spyFn = fn();
        const promise = new JestMockPromise();

        const returnedValue = 1;
        class CacheTestClass {
            @Cache
            public async asyncCacheableMethod() {
                spyFn();
                await promise;
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallPromise = testClassInstance.asyncCacheableMethod();
        promise.resolve();
        const secondCallPromise = testClassInstance.asyncCacheableMethod();

        const firstCallResult = await firstCallPromise;
        const secondCallResult = await secondCallPromise;

        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
        expect(spyFn.mock.calls.length).toBe(1);
    });

    test('Cache must be used when async method is called second time with same parameter. Stored value must be correct.', async () => {
        const spyFn = fn();
        const promise = new JestMockPromise();
        const additionSeed = 1;
        const firstCallParameter = 2;
        const secondCallParameter = 3;
        class CacheTestClass {
            @Cache
            public async oneParametersAsyncCacheableMethod(parameter: number) {
                spyFn();
                const additionSeedValue = await promise;
                return additionSeedValue + parameter;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallPromise =
            testClassInstance.oneParametersAsyncCacheableMethod(firstCallParameter);
        const secondCallPromise =
            testClassInstance.oneParametersAsyncCacheableMethod(secondCallParameter);
        const spyCallsAfterSecondTimeMethodCall = spyFn.mock.calls.length;
        const thirdCallPromise =
            testClassInstance.oneParametersAsyncCacheableMethod(firstCallParameter);
        const spyCallsAfterThirdTimeMethodCall = spyFn.mock.calls.length;
        promise.resolve(additionSeed);

        const firstCallResult = await firstCallPromise;
        const secondCallResult = await secondCallPromise;
        const thirdCallResult = await thirdCallPromise;

        expect(spyCallsAfterSecondTimeMethodCall).toBe(2);
        expect(spyCallsAfterThirdTimeMethodCall).toBe(2);
        expect(firstCallResult).toBe(additionSeed + firstCallParameter);
        expect(secondCallResult).toBe(additionSeed + secondCallParameter);
        expect(thirdCallResult).toBe(firstCallResult);
    });

    test('Cache decorator must works with getters.', () => {
        const spyFn = fn();
        const returnedValue = 1;
        class CacheTestClass {
            @Cache
            public get cacheableGetter(): number {
                spyFn();
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallResult = testClassInstance.cacheableGetter;
        const secondCallResult = testClassInstance.cacheableGetter;

        expect(spyFn.mock.calls.length).toBe(1);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Cached value must be used before maxAge time is not up. ', () => {
        jest.useFakeTimers().setSystemTime(0);
        const spyFn = fn();
        const returnedValue = 1;
        const maxAge = 10;
        class CacheTestClass {
            @Cache({ maxAge })
            public cacheableMethod(): number {
                spyFn();
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallResult = testClassInstance.cacheableMethod();
        jest.useFakeTimers().setSystemTime(maxAge - 1);
        const secondCallResult = testClassInstance.cacheableMethod();

        expect(spyFn.mock.calls.length).toBe(1);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Cached value must not be used after maxAge time is up.', () => {
        jest.useFakeTimers().setSystemTime(0);
        const spyFn = fn();
        const returnedValue = 1;
        const maxAge = 10;
        class CacheTestClass {
            @Cache({ maxAge })
            public cacheableMethod(): number {
                spyFn();
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallResult = testClassInstance.cacheableMethod();
        jest.useFakeTimers().setSystemTime(maxAge + 1);
        const secondCallResult = testClassInstance.cacheableMethod();

        expect(spyFn.mock.calls.length).toBe(2);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Cached value must be used in async function before maxAge time is up but even if first promise has not resolved yet.', async () => {
        jest.useFakeTimers().setSystemTime(0);
        const spyFn = fn();
        const promise = new JestMockPromise();
        const returnedValue = 1;
        const maxAge = 10;
        class CacheTestClass {
            @Cache({ maxAge: 10 })
            public async cacheableMethod(): Promise<number> {
                spyFn();
                await promise;
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallPromise = testClassInstance.cacheableMethod();
        jest.useFakeTimers().setSystemTime(maxAge - 1);
        const secondCallPromise = testClassInstance.cacheableMethod();
        promise.resolve();
        const firstCallResult = await firstCallPromise;
        const secondCallResult = await secondCallPromise;

        expect(spyFn.mock.calls.length).toBe(1);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Cached value must not be used in async function after maxAge time is up but even if first promise has not resolved yet.', async () => {
        jest.useFakeTimers().setSystemTime(0);
        const spyFn = fn();
        const promise = new JestMockPromise();
        const returnedValue = 1;
        const maxAge = 10;
        class CacheTestClass {
            @Cache({ maxAge: 10 })
            public async cacheableMethod(): Promise<number> {
                spyFn();
                await promise;
                return returnedValue;
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallPromise = testClassInstance.cacheableMethod();
        jest.useFakeTimers().setSystemTime(maxAge + 1);
        const secondCallPromise = testClassInstance.cacheableMethod();
        promise.resolve();
        const firstCallResult = await firstCallPromise;
        const secondCallResult = await secondCallPromise;

        expect(spyFn.mock.calls.length).toBe(2);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Conditional cache must not be saved if flag is passed.', () => {
        const spyFn = fn();
        const returnedValue = 1;
        class CacheTestClass {
            @Cache({ conditionalCache: true })
            public conditionalCacheableMethod() {
                spyFn();
                return {
                    notSave: true,
                    value: returnedValue
                };
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallResult = testClassInstance.conditionalCacheableMethod();
        const secondCallResult = testClassInstance.conditionalCacheableMethod();

        expect(spyFn.mock.calls.length).toBe(2);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Conditional cache must be saved if flag is not passed.', () => {
        const spyFn = fn();
        const returnedValue = 1;
        class CacheTestClass {
            @Cache({ conditionalCache: true })
            public conditionalCacheableMethod() {
                spyFn();
                return {
                    notSave: false,
                    value: returnedValue
                };
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallResult = testClassInstance.conditionalCacheableMethod();
        const secondCallResult = testClassInstance.conditionalCacheableMethod();

        expect(spyFn.mock.calls.length).toBe(1);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Conditional cache must be saved if flag is not passed in async method.', async () => {
        const spyFn = fn();
        const promise = new JestMockPromise();
        const returnedValue = 1;
        class CacheTestClass {
            @Cache({ conditionalCache: true })
            public async conditionalAsyncCacheableMethod() {
                spyFn();
                await promise;
                return {
                    notSave: false,
                    value: returnedValue
                };
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallPromise = testClassInstance.conditionalAsyncCacheableMethod();
        promise.resolve();
        const secondCallPromise = testClassInstance.conditionalAsyncCacheableMethod();
        const firstCallResult = await firstCallPromise;
        const secondCallResult = await secondCallPromise;

        expect(spyFn.mock.calls.length).toBe(1);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
    });

    test('Conditional cache must be saved before async method resolves, but must not be saved after promise resolving if fleg is passed.', async () => {
        const spyFn = fn();
        const promise = new JestMockPromise();
        const returnedValue = 1;
        class CacheTestClass {
            @Cache({ conditionalCache: true })
            public async conditionalAsyncCacheableMethod() {
                spyFn();
                await promise;
                return {
                    notSave: true,
                    value: returnedValue
                };
            }
        }

        const testClassInstance = new CacheTestClass();
        const firstCallPromise = testClassInstance.conditionalAsyncCacheableMethod();
        const secondCallPromise = testClassInstance.conditionalAsyncCacheableMethod();
        const spyCallsNumberAfterSecondMethodCall = spyFn.mock.calls.length;
        promise.resolve();
        const firstCallResult = await firstCallPromise;
        const secondCallResult = await secondCallPromise;

        const thirdCallPromise = testClassInstance.conditionalAsyncCacheableMethod();
        const spyCallsNumberAfterThirdMethodCall = spyFn.mock.calls.length;
        promise.resolve();
        const thirdCallResult = await thirdCallPromise;

        expect(spyCallsNumberAfterSecondMethodCall).toBe(1);
        expect(spyCallsNumberAfterThirdMethodCall).toBe(2);
        expect(firstCallResult).toBe(returnedValue);
        expect(secondCallResult).toBe(returnedValue);
        expect(thirdCallResult).toBe(returnedValue);
    });
});
