import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const symbiosisCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.BOBA_BSC,
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.SCROLL,
    BLOCKCHAIN_NAME.METIS,
    BLOCKCHAIN_NAME.BITCOIN,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.MERLIN,
    BLOCKCHAIN_NAME.ROOTSTOCK,
    BLOCKCHAIN_NAME.MODE,
    BLOCKCHAIN_NAME.ZK_LINK,
    BLOCKCHAIN_NAME.SEI,
    BLOCKCHAIN_NAME.TAIKO,
    BLOCKCHAIN_NAME.CORE,
    // Testnets
    BLOCKCHAIN_NAME.GOERLI,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
    BLOCKCHAIN_NAME.FUJI,
    BLOCKCHAIN_NAME.MUMBAI,
    BLOCKCHAIN_NAME.SCROLL_SEPOLIA,
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.MANTA_PACIFIC
] as const;

export type SymbiosisCrossChainSupportedBlockchain =
    (typeof symbiosisCrossChainSupportedBlockchains)[number];
