import {
    BLOCKCHAIN_NAME,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { TronWebProvider } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-web-provider';
import { RpcProvider } from 'src/core/sdk/models/rpc-provider';

export const freeRpc: Partial<
    Record<EvmBlockchainName, RpcProvider<string>> &
        Record<TronBlockchainName, RpcProvider<TronWebProvider>>
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        rpcList: ['https://rpc.ankr.com/eth']
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        rpcList: ['https://bsc-dataseed.binance.org']
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        rpcList: ['https://polygon-rpc.com']
    },
    [BLOCKCHAIN_NAME.TRON]: {
        rpcList: [
            {
                fullHost: 'https://rpc.ankr.com/http/tron'
            }
        ]
    }
};
