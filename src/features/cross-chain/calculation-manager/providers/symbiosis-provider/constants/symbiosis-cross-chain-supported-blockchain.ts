import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const symbiosisCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.BOBA_BSC,
    BLOCKCHAIN_NAME.BOBA_AVALANCHE,
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.LINEA
] as const;

export type SymbiosisCrossChainSupportedBlockchain =
    (typeof symbiosisCrossChainSupportedBlockchains)[number];
