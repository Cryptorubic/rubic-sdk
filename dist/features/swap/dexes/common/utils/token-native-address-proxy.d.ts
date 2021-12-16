import { Token } from '@core/blockchain/tokens/token';
export declare function createTokenNativeAddressProxy<T extends Token>(token: T, wrappedNativeAddress: string): T;
