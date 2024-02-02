import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PrivateSupportedChainType } from 'src/core/blockchain/web3-private-service/models/web-private-supported-chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { SolanaWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/solana-web3-private';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import {
    EvmWalletProviderCore,
    SolanaWalletProviderCore,
    TronWalletProviderCore,
    WalletProviderCore
} from 'src/core/sdk/models/wallet-provider';

export type CreateWeb3Private = Record<
    Web3PrivateSupportedChainType,
    (walletProviderCore: WalletProviderCore) => Web3Private
> & {
    [CHAIN_TYPE.EVM]: (walletProviderCore: EvmWalletProviderCore) => EvmWeb3Private;
    [CHAIN_TYPE.TRON]: (walletProviderCore: TronWalletProviderCore) => TronWeb3Private;
    [CHAIN_TYPE.SOLANA]: (walletProviderCore: SolanaWalletProviderCore) => SolanaWeb3Private;
};
