import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Configuration } from '@core/sdk/models/configuration';
import { Global } from '__tests__/utils/models/global';

const { providers } = (global as unknown as Global).sdkEnv;

function checkConfig() {
    if (!providers[BLOCKCHAIN_NAME.ETHEREUM]?.jsonRpcUrl) {
        throw new Error('Eth rpc was not configured');
    }

    if (!providers[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]?.jsonRpcUrl) {
        throw new Error('Bsc rpc was not configured');
    }

    if (!providers[BLOCKCHAIN_NAME.POLYGON]?.jsonRpcUrl) {
        throw new Error('Polygon rpc was not configured');
    }
}

checkConfig();
export const configuration: Configuration = {
    rpcProviders: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
            mainRpc: providers[BLOCKCHAIN_NAME.ETHEREUM]?.jsonRpcUrl!!
        },
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
            mainRpc: providers[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]?.jsonRpcUrl!!
        },
        [BLOCKCHAIN_NAME.POLYGON]: {
            mainRpc: providers[BLOCKCHAIN_NAME.POLYGON]?.jsonRpcUrl!!
        }
    }
};
