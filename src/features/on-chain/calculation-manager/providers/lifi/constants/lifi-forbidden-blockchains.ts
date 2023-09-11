import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const lifiForbiddenBlockchains = [BLOCKCHAIN_NAME.ZK_SYNC, BLOCKCHAIN_NAME.BASE] as const;

export type LifiForbiddenBlockchains = (typeof lifiForbiddenBlockchains)[number];
