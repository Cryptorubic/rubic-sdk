import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { provider } from 'web3-core';
import Web3 from 'web3';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';

export interface WalletProviderCore<T> {
    /**
     * Core provider.
     */
    readonly core: T;

    /**
     * User wallet address.
     */
    readonly address: string;
}

export type EvmWalletProviderCore = WalletProviderCore<provider | Web3>;
export type TronWalletProviderCore = WalletProviderCore<typeof TronWeb>;

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
export interface WalletProvider {
    readonly [CHAIN_TYPE.EVM]?: EvmWalletProviderCore;
    readonly [CHAIN_TYPE.TRON]?: TronWalletProviderCore;
}
