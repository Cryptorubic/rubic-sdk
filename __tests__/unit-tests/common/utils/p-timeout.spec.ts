import { TimeoutError } from '@rsdk-common/errors/utils/timeout.error';
import pTimeout from '@rsdk-common/utils/p-timeout';
import CancelablePromise from 'cancelable-promise';
import delay from 'delay';
import fn = jest.fn;

describe('p-timeout tests', () => {
    const expected = Symbol('expected');
    const expectedError = new Error('expectedError');

    const smallTimeout = 50;
    const bigTimeout = 200;

    test('Resolves before timeout', async () => {
        const result = await pTimeout(
            delay(smallTimeout).then(() => expected),
            bigTimeout
        );
        expect(result).toBe(expected);
    });

    test('Resolves after timeout', async () => {
        await expect(pTimeout(delay(bigTimeout), smallTimeout)).rejects.toThrow(
            new TimeoutError(`Promise timed out after ${smallTimeout} milliseconds`)
        );
    });

    test('Throws when milliseconds is negative number', async () => {
        const milliseconds = -1;
        await expect(pTimeout(delay(smallTimeout), milliseconds)).rejects.toThrow(
            `Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``
        );
    });

    test('Throws when milliseconds is NaN', async () => {
        const milliseconds = NaN;
        await expect(pTimeout(delay(smallTimeout), milliseconds)).rejects.toThrow(
            `Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``
        );
    });

    test('Handles milliseconds being `Infinity`', async () => {
        const result = await pTimeout(
            delay(smallTimeout).then(() => expected),
            +Infinity
        );
        expect(result).toBe(expected);
    });

    test('Rejects after timeout', async () => {
        await expect(
            pTimeout(
                delay(bigTimeout).then(() => expected),
                smallTimeout
            )
        ).rejects.toThrow(new TimeoutError(`Promise timed out after ${smallTimeout} milliseconds`));
    });

    test('Rejects before timeout if specified promise rejects', async () => {
        await expect(
            pTimeout(
                delay(smallTimeout).then(() => Promise.reject(expectedError)),
                bigTimeout
            )
        ).rejects.toThrow(expectedError);
    });

    test('Fallback argument', async () => {
        await expect(pTimeout(delay(bigTimeout), smallTimeout, 'error message')).rejects.toThrow(
            'error message'
        );
        await expect(
            pTimeout(delay(bigTimeout), smallTimeout, new RangeError('error message'))
        ).rejects.toThrow(new RangeError('error message'));
        await expect(
            pTimeout(delay(bigTimeout), smallTimeout, () => Promise.reject(expectedError))
        ).rejects.toThrow(expectedError);
        await expect(
            pTimeout(delay(bigTimeout), smallTimeout, () => {
                throw new RangeError('error message');
            })
        ).rejects.toThrow(new RangeError('error message'));
    });

    test('Calls `.cancel()` on promise when it exists', async () => {
        const callSpy = fn();

        const promise = new CancelablePromise<void>(async (resolve, _, onCancel) => {
            onCancel(() => {
                callSpy();
            });

            await delay(bigTimeout);
            resolve();
        });

        await expect(pTimeout(promise, smallTimeout)).rejects.toThrow(
            new TimeoutError(`Promise timed out after ${smallTimeout} milliseconds`)
        );
        expect(promise.isCanceled).toBeTruthy();
        expect(callSpy.mock.calls.length).toBe(1);
    });

    test('Accepts `customTimers` option', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const setTimeoutSpy = fn((_: number | undefined) => {});
        const clearTimeoutSpy = fn();

        await pTimeout(delay(smallTimeout), bigTimeout, undefined, {
            customTimers: {
                setTimeout: function (handler: () => void, timeout?: number) {
                    setTimeoutSpy(timeout);
                    return setTimeout(handler as unknown as () => void, timeout || 1000);
                } as typeof setTimeout,
                clearTimeout(timeoutId) {
                    clearTimeoutSpy();
                    return clearTimeout(timeoutId);
                }
            }
        });

        expect(setTimeoutSpy.mock.calls.length).toBe(1);
        expect(setTimeoutSpy.mock.calls[0]).toEqual([bigTimeout]);
        expect(clearTimeoutSpy.mock.calls.length).toBe(1);
    });

    test('`.clear()` method', async () => {
        const promise = pTimeout(
            delay(bigTimeout).then(() => expected),
            smallTimeout
        );
        promise.clear();

        const result = await promise;
        expect(result).toBe(expected);
    });
});
