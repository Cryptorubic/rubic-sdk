export interface BtcWalletProvider {
    on: (event: string, callback: (...args: unknown[]) => void) => unknown;
    request<T>(
        args: {
            method: string;
            params: unknown[];
        },
        fn: (error: Error, accounts: string[]) => unknown
    ): Promise<{ error: null | Error; result: T }>;
}