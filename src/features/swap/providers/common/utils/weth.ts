import { Token } from '@core/blockchain/tokens/token';

export function createTokenWethAbleProxy<T extends Token>(token: T, wethAddress: string): T {
    const wethAbleAddress = token.isNative ? wethAddress : token.address;
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
