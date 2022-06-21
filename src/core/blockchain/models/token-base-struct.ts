import { BlockchainName } from '@core/blockchain/models/blockchain-name';

/**
 * Stores basic information of token.
 */
export interface TokenBaseStruct {
    address: string;
    blockchain: BlockchainName;
}
