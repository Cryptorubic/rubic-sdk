import { Token } from '../../../../../core/blockchain/tokens/token';
export declare function createTokenNativeAddressProxy<T extends Token>(token: T, wrappedNativeAddress: string): T;
export declare function createTokenNativeAddressProxyInPathStartAndEnd<T extends Token>(path: T[] | ReadonlyArray<T>, wrappedNativeAddress: string): ReadonlyArray<T>;
