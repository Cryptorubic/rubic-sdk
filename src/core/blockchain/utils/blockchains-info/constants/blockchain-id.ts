import { blockchainId as RUBIC_MONOREPO_BLOCKCHAIN_ID } from '@cryptorubic/core';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
const otherChains = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: NaN }),
    {} as Record<BlockchainName, number>
);

export const blockchainId: Record<BlockchainName, number> = RUBIC_MONOREPO_BLOCKCHAIN_ID;
