import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const OKUSWAP_ON_CHAIN_SUPPORTED_BLOCKCHAINS = [BLOCKCHAIN_NAME.ROOTSTOCK] as const;

export type OkuSwapSupportedBlockchain = (typeof OKUSWAP_ON_CHAIN_SUPPORTED_BLOCKCHAINS)[number];
