import { SwapRequestInterface } from '@cryptorubic/core';

export type SetOptionalFields<K extends keyof T, T> = {
    [P in keyof T]: P extends K ? undefined | T[P] : T[P];
};

export type TransferSwapRequestInterface = SetOptionalFields<'fromAddress', SwapRequestInterface>;
