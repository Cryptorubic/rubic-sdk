import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const rangoCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.MOONBEAM,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.POLYGON_ZKEVM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.BOBA_BSC,
    BLOCKCHAIN_NAME.BOBA_AVALANCHE
] as const;

export type RangoCrossChainSupportedBlockchain =
    (typeof rangoCrossChainSupportedBlockchains)[number];
