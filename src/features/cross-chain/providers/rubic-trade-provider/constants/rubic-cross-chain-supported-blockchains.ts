import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const rubicCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.TELOS
] as const;

export type RubicCrossChainSupportedBlockchain = typeof rubicCrossChainSupportedBlockchains[number];
