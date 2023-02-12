import {
    BLOCKCHAIN_NAME,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';

export const web3PublicSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.OKE_X_CHAIN,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.FUSE,
    BLOCKCHAIN_NAME.MOONBEAM,
    BLOCKCHAIN_NAME.CELO,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.BOBA_BSC,
    BLOCKCHAIN_NAME.BOBA_AVALANCHE,
    BLOCKCHAIN_NAME.ASTAR,
    BLOCKCHAIN_NAME.ETHEREUM_POW,
    BLOCKCHAIN_NAME.KAVA,
    BLOCKCHAIN_NAME.BITGERT,
    BLOCKCHAIN_NAME.OASIS,
    BLOCKCHAIN_NAME.METIS,
    BLOCKCHAIN_NAME.DFK,
    BLOCKCHAIN_NAME.KLAYTN,
    BLOCKCHAIN_NAME.VELAS,
    BLOCKCHAIN_NAME.SYSCOIN,
    BLOCKCHAIN_NAME.TRON
] as const;

export type Web3PublicSupportedBlockchain = (typeof web3PublicSupportedBlockchains)[number];

export type Web3PublicStorage = Record<Web3PublicSupportedBlockchain, Web3Public> &
    Record<EvmBlockchainName, EvmWeb3Public> &
    Record<TronBlockchainName, TronWeb3Public>;
