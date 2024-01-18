import {
    EvmBlockchainName,
    SolanaBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { TronWebProvider } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/models/tron-web-provider';

/**
 * Stores information about rpc in certain blockchain.
 */
export interface RpcProvider<T> {
    /**
     * Contains rpc links in order of prioritization. Used instead of deprecated `mainRpc` and `spareRpc` fields.
     */
    readonly rpcList: T[];

    /**
     * Specifies timeout in ms after which `mainRpc` will be replaced with `spareRpc` (if `spareRpc` is defined)
     */
    readonly mainRpcTimeout?: number;
}

export type RpcProviders = Partial<
    Record<EvmBlockchainName, RpcProvider<string>> &
        Record<TronBlockchainName, RpcProvider<TronWebProvider>> &
        Record<SolanaBlockchainName, RpcProvider<string>>
>;
