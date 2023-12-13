import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const pulseChainSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.PULSECHAIN
] as const;

export type PulseChainCrossChainSupportedBlockchain =
    (typeof pulseChainSupportedBlockchains)[number];
