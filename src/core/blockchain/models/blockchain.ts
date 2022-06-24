import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { Token } from '@rsdk-core/blockchain/tokens/token';

/**
 * Stores information about blockchain.
 */
export interface Blockchain {
    id: number;
    name: BlockchainName;
    nativeCoin: Token;
}
