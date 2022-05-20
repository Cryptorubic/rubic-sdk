import { BlockchainName } from 'src/core';

export interface Global {
    sdkEnv: {
        providers: Record<BlockchainName, { jsonRpcUrl: string; blockNumber: number }>;
    };
}
