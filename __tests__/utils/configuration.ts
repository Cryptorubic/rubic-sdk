import { BLOCKCHAIN_NAME, BlockchainName } from '../../src/core/blockchain/models/blockchain-name';
import { Configuration } from '../../src/core/sdk/models/configuration';

const baseRpcUrl = 'http://localhost';

const addPort = (port: number) => `${baseRpcUrl}:${port}`;

export const publicProvidersRPC: Partial<Record<BlockchainName, string>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: addPort(8545),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: addPort(8546),
    [BLOCKCHAIN_NAME.POLYGON]: addPort(8547)
};

export const publicProvidersSupportServerUrls: Partial<Record<BlockchainName, string>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: addPort(1545),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: addPort(1546),
    [BLOCKCHAIN_NAME.POLYGON]: addPort(1547)
};

export const minimalConfiguration: Configuration = {
    rpcProviders: Object.fromEntries(
        Object.entries(publicProvidersRPC).map(([key, value]) => [
            key,
            {
                mainRpc: value
            }
        ])
    )
};
