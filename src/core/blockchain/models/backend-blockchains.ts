import { BLOCKCHAIN_NAME, BlockchainName } from './blockchain-name';
import {
    TO_BACKEND_BLOCKCHAINS as RUBIC_MONOREPO_TO_BACKEND_BLOCKCHAINS,
    BackendBlockchain as RubicMonorepoBackendBlockchain,
    FROM_BACKEND_BLOCKCHAINS as RUBIC_MONOREPO_FROM_BACKEND_BLOCKCHAINS
} from '@cryptorubic/core';


export const TO_BACKEND_BLOCKCHAINS: Record<BlockchainName, BackendBlockchain> =
    RUBIC_MONOREPO_TO_BACKEND_BLOCKCHAINS;

export type BackendBlockchain = RubicMonorepoBackendBlockchain;

export const FROM_BACKEND_BLOCKCHAINS: Record<BackendBlockchain, BlockchainName> =
    RUBIC_MONOREPO_FROM_BACKEND_BLOCKCHAINS;
