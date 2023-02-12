import { Configuration } from 'src/core/sdk/models/configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const sdkConfiguration: Configuration = {
    rpcProviders: {
        [BLOCKCHAIN_NAME.POLYGON]: {
            rpcList: [
                'https://rpc.ankr.com/polygon',
                'https://polygon-rpc.com',
                'https://rpc-mainnet.matic.quiknode.pro'
            ]
        }
    }
};
