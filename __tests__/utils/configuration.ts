import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Configuration } from '@core/sdk/models/configuration';

export const configuration: Configuration = {
    rpcProviders: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
            mainRpc: 'https://main-light.eth.linkpool.io'
        },
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
            mainRpc: 'https://bsc-dataseed.binance.org/'
        }
    }
};
