import { TonConnectUI } from '@tonconnect/ui';
import { Any } from 'src/common/utils/types';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BtcWalletProvider } from 'src/core/sdk/models/btc-wallet-provider';
import { SolanaWeb3 } from 'src/core/sdk/models/solana-web3';
import Web3 from 'web3';
import { provider } from 'web3-core';

export interface WalletProviderCore<T = Any> {
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
export type SolanaWalletProviderCore = WalletProviderCore<SolanaWeb3>;
export type TonWalletProviderCore = WalletProviderCore<TonConnectUI>;
export type BitcoinWalletProviderCore = WalletProviderCore<BtcWalletProvider>;

/**
 * Stores wallet core and information about current user, used to make `send` transactions.
 */
interface IWalletProvider {
    readonly [CHAIN_TYPE.EVM]?: EvmWalletProviderCore;
    readonly [CHAIN_TYPE.TRON]?: TronWalletProviderCore;
    readonly [CHAIN_TYPE.SOLANA]?: SolanaWalletProviderCore;
    readonly [CHAIN_TYPE.TON]?: TonWalletProviderCore;
    readonly [CHAIN_TYPE.BITCOIN]?: BitcoinWalletProviderCore;
}

export type WalletProvider = Partial<IWalletProvider>;
