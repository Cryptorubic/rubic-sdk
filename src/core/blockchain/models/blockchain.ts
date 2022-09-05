import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { Token } from 'src/common';

/**
 * Stores information about blockchain.
 */
export interface Blockchain {
    id: number;
    name: BlockchainName;
    nativeCoin: Token;
}
