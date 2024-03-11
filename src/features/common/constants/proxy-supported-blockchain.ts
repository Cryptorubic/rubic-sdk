import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const proxySupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.PULSECHAIN,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.SCROLL,
    BLOCKCHAIN_NAME.MANTA_PACIFIC,
    BLOCKCHAIN_NAME.METIS,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.KROMA
    // BLOCKCHAIN_NAME.OKE_X_CHAIN,
    // BLOCKCHAIN_NAME.GNOSIS,
    // BLOCKCHAIN_NAME.FUSE,
    // BLOCKCHAIN_NAME.MOONBEAM,
    // BLOCKCHAIN_NAME.CELO,
    // BLOCKCHAIN_NAME.BOBA,
    // BLOCKCHAIN_NAME.KAVA,
    // BLOCKCHAIN_NAME.BITGERT,
    // BLOCKCHAIN_NAME.KLAYTN,
    // BLOCKCHAIN_NAME.SYSCOIN,
    // BLOCKCHAIN_NAME.VELAS,
    // BLOCKCHAIN_NAME.OASIS
] as const;

export type ProxySupportedBlockchain = (typeof proxySupportedBlockchains)[number];
