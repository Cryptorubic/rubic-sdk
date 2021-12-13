import { Token } from '@core/blockchain/tokens/token';

export function createTokenNativeAddressProxy<T extends Token>(
    token: T,
    wrappedNativeAddress: string
): T {
    const wethAbleAddress = token.isNative ? wrappedNativeAddress : token.address;
    return new Proxy<T>(token, {
        get: (target, key) => {
            if (!(key in target)) {
                return undefined;
            }
            if (key === 'address') {
                return wethAbleAddress;
            }
            return target[key as keyof T];
        }
    });
}
