import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const lifiForbiddenBlockchains = [BLOCKCHAIN_NAME.SOLANA] as const;

export type LifiForbiddenBlockchains = (typeof lifiForbiddenBlockchains)[number];
