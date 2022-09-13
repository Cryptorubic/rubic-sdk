import {
    BLOCKCHAIN_NAME,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';

export const web3PublicSupportedBlockchains = [
    ...Object.values(EVM_BLOCKCHAIN_NAME),
    BLOCKCHAIN_NAME.TRON
] as const;

export type Web3PublicSupportedBlockchain = typeof web3PublicSupportedBlockchains[number];

export type Web3PublicStorage = Record<Web3PublicSupportedBlockchain, Web3Public> &
    Record<EvmBlockchainName, EvmWeb3Public> &
    Record<TronBlockchainName, TronWeb3Public>;
