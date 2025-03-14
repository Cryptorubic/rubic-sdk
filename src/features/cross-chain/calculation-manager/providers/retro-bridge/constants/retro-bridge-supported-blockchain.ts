import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const retroBridgeSupportedBlockchain = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.STARKNET,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.SCROLL,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.MANTA_PACIFIC,
    BLOCKCHAIN_NAME.MODE,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.KROMA,
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.ZK_LINK,
    BLOCKCHAIN_NAME.TAIKO,
    BLOCKCHAIN_NAME.METIS,
    BLOCKCHAIN_NAME.XLAYER,
    BLOCKCHAIN_NAME.GRAVITY,
    BLOCKCHAIN_NAME.TON
    // Disabled because transactions from Morph to Any chain do not work properly.
    // BLOCKCHAIN_NAME.MORPH
];

export type RetroBridgeSupportedBlockchain = (typeof retroBridgeSupportedBlockchain)[number];
