import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const orbiterSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.ARBITRUM,
    // BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.MANTA_PACIFIC,
    BLOCKCHAIN_NAME.SCROLL,
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.KROMA,
    BLOCKCHAIN_NAME.STARKNET,
    BLOCKCHAIN_NAME.ZK_FAIR
] as const;

export type OrbiterSupportedBlockchain = (typeof orbiterSupportedBlockchains)[number];
