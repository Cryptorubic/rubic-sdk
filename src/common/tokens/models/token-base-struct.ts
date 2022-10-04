import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

/**
 * Stores basic information of token.
 */
export interface TokenBaseStruct<T extends BlockchainName = BlockchainName> {
    address: string;
    blockchain: T;
}
