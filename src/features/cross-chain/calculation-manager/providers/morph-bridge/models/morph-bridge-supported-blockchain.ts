import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const morphBridgeSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.MORPH
] as const;

export type MorphBridgeSupportedBlockchain = (typeof morphBridgeSupportedBlockchains)[number];
