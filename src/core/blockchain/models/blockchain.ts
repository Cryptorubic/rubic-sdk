import { BlockchainName } from '@core/blockchain/models/blockchain-name';
import { Token } from '@core/blockchain/tokens/token';

/**
 * Stores information about blockchain.
 */
export interface Blockchain {
    id: number;
    name: BlockchainName;
    nativeCoin: Token;
}
