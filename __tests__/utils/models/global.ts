import { BLOCKCHAIN_NAME } from 'src/core';

export interface Global {
    sdkEnv: {
        hardhatProviders: Record<BLOCKCHAIN_NAME, { jsonRpcUrl: string; blockNumber: number }>;
    };
}
