import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

/**
 * Stores information about blockchain.
 */
export interface Blockchain<T extends BlockchainName = BlockchainName> {
    id: number;
    name: T;
}
