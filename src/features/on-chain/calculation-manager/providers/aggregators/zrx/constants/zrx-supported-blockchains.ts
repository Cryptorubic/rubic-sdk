import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const zeroXSupportedBlockchains = [BLOCKCHAIN_NAME.ETHEREUM] as const;

export type ZeroXSupportedBlockchains = (typeof zeroXSupportedBlockchains)[number];
