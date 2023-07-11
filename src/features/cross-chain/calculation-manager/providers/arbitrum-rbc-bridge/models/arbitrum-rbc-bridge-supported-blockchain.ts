import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const arbitrumRbcBridgeSupportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.ARBITRUM
] as const;

export type ArbitrumRbcBridgeSupportedBlockchain =
    (typeof arbitrumRbcBridgeSupportedBlockchains)[number];
