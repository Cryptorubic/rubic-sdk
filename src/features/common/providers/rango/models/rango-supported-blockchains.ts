import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const rangoSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.METIS,
    // BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.LINEA
] as const;

export type RangoSupportedBlockchain = (typeof rangoSupportedBlockchains)[number];