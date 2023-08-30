import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const scrollBridgeSupportedBlockchains = [
    BLOCKCHAIN_NAME.GOERLI,
    BLOCKCHAIN_NAME.SCROLL_SEPOLIA
] as const;

export type ScrollBridgeSupportedBlockchain = (typeof scrollBridgeSupportedBlockchains)[number];
