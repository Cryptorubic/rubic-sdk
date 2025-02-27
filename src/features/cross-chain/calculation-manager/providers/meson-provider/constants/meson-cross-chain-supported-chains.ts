import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const mesonCrossChainSupportedChains = [
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.MOONBEAM,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.CELO,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.KAVA,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.MANTA_PACIFIC,
    BLOCKCHAIN_NAME.MERLIN,
    BLOCKCHAIN_NAME.METIS,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.MODE,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.SCROLL,
    // BLOCKCHAIN_NAME.SOLANA,
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.XLAYER,
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.ZK_FAIR,
    BLOCKCHAIN_NAME.ZK_LINK,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.CORE,
    BLOCKCHAIN_NAME.KROMA,
    // BLOCKCHAIN_NAME.TAIKO,
    BLOCKCHAIN_NAME.BITLAYER
] as const;

export type MesonSupportedBlockchain = (typeof mesonCrossChainSupportedChains)[number];
