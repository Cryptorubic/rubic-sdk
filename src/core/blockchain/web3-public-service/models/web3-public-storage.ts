import {
    BitcoinBlockchainName,
    BLOCKCHAIN_NAME,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName,
    SolanaBlockchainName,
    TonBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BitcoinWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/bitcoin-web3-public/bitcoin-web3-public';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { SolanaWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/solana-web3-public/solana-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';

import { TonWeb3Public } from '../web3-public/ton-web3-public/ton-web3-public';

export const web3PublicSupportedBlockchains = [
    ...Object.values(EVM_BLOCKCHAIN_NAME),
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.SOLANA,
    BLOCKCHAIN_NAME.TON,
    BLOCKCHAIN_NAME.BITCOIN
] as const;

export type Web3PublicSupportedBlockchain = (typeof web3PublicSupportedBlockchains)[number];

export type Web3PublicStorage = Record<EvmBlockchainName, EvmWeb3Public> &
    Record<TronBlockchainName, TronWeb3Public> &
    Record<SolanaBlockchainName, SolanaWeb3Public> &
    Record<TonBlockchainName, TonWeb3Public> &
    Record<BitcoinBlockchainName, BitcoinWeb3Public>;
