import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const okuSwapOnChainSupportedBlockchains = [BLOCKCHAIN_NAME.ROOTSTOCK] as const;

export type OkuSwapSupportedBlockchain = (typeof okuSwapOnChainSupportedBlockchains)[number];
