import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const routerCrossChainSupportedChains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.ROOTSTOCK,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.MANTA_PACIFIC,
    BLOCKCHAIN_NAME.XLAYER,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.METIS,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.MODE,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.TAIKO,
    BLOCKCHAIN_NAME.SCROLL,
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.SUI
    // BLOCKCHAIN_NAME.SOLANA,
    // BLOCKCHAIN_NAME.BITCOIN
];

export type RouterCrossChainSupportedBlockchains = (typeof routerCrossChainSupportedChains)[number];
