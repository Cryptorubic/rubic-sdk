import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const taikoBridgeSupportedBlockchains = [
    BLOCKCHAIN_NAME.TAIKO,
    BLOCKCHAIN_NAME.HOLESKY
] as const;

export type TaikoBridgeSupportedBlockchain = (typeof taikoBridgeSupportedBlockchains)[number];
