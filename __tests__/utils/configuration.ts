import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Configuration } from '@core/sdk/models/configuration';

function checkConfig() {
    if (!process.env.ETH_RPC) {
        throw new Error('Eth rpc was not configured');
    }

    if (!process.env.BSC_RPC) {
        throw new Error('Bsc rpc was not configured');
    }
}

checkConfig();
export const configuration: Configuration = {
    rpcProviders: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
            mainRpc: process.env.ETH_RPC!!
        },
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
            mainRpc: process.env.BSC_RPC!!
        }
    }
};
