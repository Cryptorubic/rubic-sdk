import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';

export const rubicCrossChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.TELOS
] as const;

export type RubicCrossChainSupportedBlockchain = typeof rubicCrossChainSupportedBlockchains[number];
