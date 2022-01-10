import { BLOCKCHAIN_NAME } from 'src/core';

export interface Global {
    sdkEnv: {
        providers: Record<BLOCKCHAIN_NAME, { jsonRpcUrl: string; blockNumber: number }>;
    };
}
